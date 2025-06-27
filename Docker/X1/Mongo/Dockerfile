FROM mongo:latest

COPY mongod.conf /etc/mongo/mongod.conf

EXPOSE 27017

COPY init-mongo.js /docker-entrypoint-initdb.d/

