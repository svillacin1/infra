# Use the official MySQL image from the Docker Hub
FROM mysql:8.0

# Set environment variables for MySQL
# These are just examples, replace them with your actual values
ENV MYSQL_ROOT_PASSWORD=fF87J4DH3t33vnxE
ENV MYSQL_DATABASE=personadb
ENV MYSQL_USER=test
ENV MYSQL_PASSWORD=Qsx1@3esZ

# Copy any initialization scripts to the Docker entrypoint directory
# These scripts will be executed when the container is first run
COPY ./initdb.d /docker-entrypoint-initdb.d/

# Expose the default MySQL port
EXPOSE 3306

# The default command will run the MySQL server
CMD ["mysqld"]