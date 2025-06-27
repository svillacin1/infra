FROM aerospike:ee-6.2.0.2


COPY aerospike.conf /etc/aerospike/aerospike.conf
COPY aerospike_luna.conf /etc/aerospike/aerospike_luna.conf

EXPOSE 3000 3001 3002 3003


CMD ["asd", "--foreground", "--config-file", "/etc/aerospike/aerospike_luna.conf"]