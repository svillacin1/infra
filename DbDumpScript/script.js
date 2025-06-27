require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { format, subMonths, eachMonthOfInterval, parse } = require('date-fns');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;

const dbConfig = {
  host: argv.dbhost,
  user: argv.dbuser,
  password: argv.dbpass,
  database: process.env.DB_NAME,
};

const backupConfig = {
  backupDir: process.env.BACKUP_DIR,
  monthsToKeep: parseInt(process.env.MONTHS_TO_KEEP) || 6,
  tableName: argv.tbname,
  dateColumn: process.env.DATE_COLUMN,
  dateFormat: process.env.DATE_FORMAT,
  deleteAfterBackup: argv.deldata === 'true' || false,
  s3Enabled: argv.s3enabled === 'true' || false,
};

const s3Config = {
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: argv.acckey,
    secretAccessKey: argv.seckey,
  },
};

const s3Client = backupConfig.s3Enabled ? new S3Client(s3Config) : null;

function formatToDbDate(date) {
  return format(date, backupConfig.dateFormat);
}

function parseDbDate(dateString) {
  return parse(dateString, backupConfig.dateFormat, new Date());
}

async function getTableStructure(connection, tableName) {
  const [createTableResult] = await connection.query(
    `SHOW CREATE TABLE ${tableName}`
  );
  return createTableResult[0]['Create Table'];
}

async function uploadToS3(fileContent, key, maxRetries = 3, delayMs = 2000) {
  if (!backupConfig.s3Enabled) return true;

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fileContent,
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await s3Client.send(new PutObjectCommand(params));
      console.log(`S3 upload succeeded on attempt ${attempt}: ${key}`);
      return true;
    } catch (err) {
      console.error(`S3 upload failed on attempt ${attempt}:`, err);
      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
  }

  console.error(`Failed to upload to S3 after ${maxRetries} attempts.`);
  return false;
}

async function deleteBackedUpData(connection, monthStartFormatted, monthEndFormatted) {
  try {
    const [result] = await connection.query(
      `DELETE FROM ${backupConfig.tableName} 
       WHERE ${backupConfig.dateColumn} >= ? 
       AND ${backupConfig.dateColumn} <= ?`,
      [monthStartFormatted, monthEndFormatted]
    );
    console.log(`Deleted records: ${result.affectedRows}`);
  } catch (err) {
    console.error('Error while deleting data:', err);
    throw err;
  }
}

async function createMonthlyBackups() {
  try {
    if (backupConfig.s3Enabled && (!s3Config.region || !s3Config.credentials.accessKeyId)) {
      throw new Error('S3 settings are not properly configured in .env file');
    }

    const connection = await mysql.createConnection(dbConfig);
    const tableStructure = await getTableStructure(connection, backupConfig.tableName);

    const [minDateResult] = await connection.query(
      `SELECT MIN(${backupConfig.dateColumn}) as minDate FROM ${backupConfig.tableName}`
    );
    const minDateStr = minDateResult[0].minDate;

    if (!minDateStr) {
      console.log('No data in the table to back up');
      await connection.end();
      return;
    }

    const minDate = parseDbDate(minDateStr.toString());
    const cutoffDate = subMonths(new Date(), backupConfig.monthsToKeep);

    if (minDate > cutoffDate) {
      console.log('No data older than the specified period');
      await connection.end();
      return;
    }

    const monthsToBackup = eachMonthOfInterval({
      start: minDate,
      end: cutoffDate
    });

    console.log(`Months to back up: ${monthsToBackup.length}`);
    console.log(`Delete data after backup: ${backupConfig.deleteAfterBackup ? 'ON' : 'OFF'}`);

    for (const month of monthsToBackup) {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

      const monthStartFormatted = formatToDbDate(monthStart);
      const monthEndFormatted = formatToDbDate(monthEnd);

      const backupFileName = `${backupConfig.tableName}_${format(month, 'yyyy_MM')}.sql`;

      const [rows] = await connection.query(
        `SELECT * FROM ${backupConfig.tableName} 
         WHERE ${backupConfig.dateColumn} >= ? 
         AND ${backupConfig.dateColumn} <= ?`,
        [monthStartFormatted, monthEndFormatted]
      );

      if (rows.length === 0) {
        console.log(`No data to back up for ${format(month, 'yyyy-MM')}`);
        continue;
      }

      let backupContent = `# ------------------------------------------------------------\n`;
      backupContent += `# SCHEMA DUMP FOR TABLE: ${backupConfig.tableName}\n`;
      backupContent += `# ------------------------------------------------------------\n\n`;
      backupContent += `${tableStructure.replace(/CREATE TABLE/g, 'CREATE TABLE IF NOT EXISTS')};\n\n`;
      backupContent += `# ------------------------------------------------------------\n`;
      backupContent += `# DATA DUMP FOR TABLE: ${backupConfig.tableName}\n`;
      backupContent += `# ------------------------------------------------------------\n\n`;

      rows.forEach(row => {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(v =>
          typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` :
          v === null ? 'NULL' : v
        ).join(', ');

        backupContent += `INSERT INTO ${backupConfig.tableName} (${columns}) VALUES (${values});\n`;
      });

      console.log(`Backup created: ${backupFileName} (${rows.length} records)`);

      let uploadSuccess = true;

      if (backupConfig.s3Enabled) {
        const s3Key = `${argv.s3dir}/${backupFileName}`;
        uploadSuccess = await uploadToS3(backupContent, s3Key);
      }

      if (uploadSuccess &&  backupConfig.deleteAfterBackup && backupConfig.s3Enabled) {
        await deleteBackedUpData(connection, monthStartFormatted, monthEndFormatted);
      } else {
        console.log(`Skipping deletion due to failed S3 upload: ${backupFileName}`);
      }
    }

    await connection.end();

  } catch (error) {
    console.error('Error during backup process:', error);
    process.exit(1);
  }
}

createMonthlyBackups();
