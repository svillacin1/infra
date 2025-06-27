FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y \
    apt-transport-https \
    ca-certificates \
    dirmngr \
    gnupg2 \
    lsb-release \
    software-properties-common \
    wget \
    curl

RUN curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg] https://packages.clickhouse.com/deb stable main" | tee /etc/apt/sources.list.d/clickhouse.list
RUN apt update && apt install -y clickhouse-server clickhouse-client
RUN rm /etc/clickhouse-server/config.xml
RUN rm /etc/clickhouse-server/users.xml

COPY ac_device_dictionary.xml /etc/clickhouse-server/ac_device_dictionary.xml
COPY ac_dsp_dictionary.xml /etc/clickhouse-server/ac_dsp_dictionary.xml
COPY ac_formats_dictionary.xml /etc/clickhouse-server/ac_formats_dictionary.xml
COPY ac_requestDevTypes_dictionary.xml /etc/clickhouse-server/ac_requestDevTypes_dictionary.xml
COPY ac_ssp_dictionary.xml /etc/clickhouse-server/ac_ssp_dictionary.xml
COPY config_luna.xml /etc/clickhouse-server/config.xml
COPY dspIdSettings_dictionary.xml /etc/clickhouse-server/dspIdSettings_dictionary.xml
COPY dspSettings_dictionary.xml /etc/clickhouse-server/dspSettings_dictionary.xml
COPY sspSettings_dictionary.xml /etc/clickhouse-server/sspSettings_dictionary.xml
COPY users.xml /etc/clickhouse-server/users.xml
#COPY test.xml /etc/clickhouse-server/users.xml
COPY backup /var/lib/clickhouse
RUN chown -R clickhouse:clickhouse /etc/clickhouse-server/
#RUN cat /etc/clickhouse-server/config.d/config_luna.xml > /etc/clickhouse-server/config.xml

EXPOSE 8123 9000 9009
ENTRYPOINT ["clickhouse-server"]