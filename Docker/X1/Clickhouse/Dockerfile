# Use the official ClickHouse server image from Docker Hub
FROM clickhouse/clickhouse-server:latest

COPY ac_device_dictionary.xml /etc/clickhouse-server/ac_device_dictionary.xml
COPY ac_dsp_dictionary.xml /etc/clickhouse-server/ac_dsp_dictionary.xml
COPY ac_formats_dictionary.xml /etc/clickhouse-server/ac_formats_dictionary.xml
COPY ac_requestDevTypes_dictionary.xml /etc/clickhouse-server/ac_requestDevTypes_dictionary.xml
COPY ac_ssp_dictionary.xml /etc/clickhouse-server/ac_ssp_dictionary.xml
#COPY config_luna.xml /etc/clickhouse-server/config.d/config_luna.xml
COPY config_luna.xml /etc/clickhouse-server/config.xml
COPY dspIdSettings_dictionary.xml /etc/clickhouse-server/dspIdSettings_dictionary.xml
COPY dspSettings_dictionary.xml /etc/clickhouse-server/dspSettings_dictionary.xml
COPY sspSettings_dictionary.xml /etc/clickhouse-server/sspSettings_dictionary.xml
#COPY test.xml /etc/clickhouse-server/users.d/users.xml
COPY test.xml /etc/clickhouse-server/users.xml
COPY backup /var/lib/clickhouse
#RUN cat /etc/clickhouse-server/users.d/users.xml > /etc/clickhouse-server/config.d/config_luna.xml
#RUN cat /etc/clickhouse-server/config.d/config_luna.xml > /etc/clickhouse-server/config.xml
# Expose ClickHouse ports
EXPOSE 8123 9000 9009

# Set the entrypoint to start ClickHouse server
ENTRYPOINT ["clickhouse-server"]