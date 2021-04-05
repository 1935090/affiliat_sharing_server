//const steamApi = require("./steam");
//const userApi = require("./user");
//const adminApi = require("./admin");
const teddyApi = require("./teddy");

function api({ server }) {
  /*server.use("/api/v1/steam", steamApi);
  server.use("/api/v1/user", userApi);
  server.use("/api/v1/admin", adminApi);*/
  server.use("/api/v1/aspf", teddyApi);
}

module.exports = api;
