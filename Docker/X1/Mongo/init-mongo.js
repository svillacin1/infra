db = db.getSiblingDB('admin');
db.createUser({
  user: "lunaAdmin",
  pwd: "n9A7_u77hL@^g(VV",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
});

db.createUser({
  user: "ssp",
  pwd: "bBt9E28d24vZJ8uN",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
});

db = db.getSiblingDB('exchange');
db.createUser({
  user: "luna",
  pwd: "756cUd8KthDT24At",
  roles: [ { role: "readWrite", db: "exchange" } ]
});