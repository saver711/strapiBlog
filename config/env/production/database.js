// 👁️ this will overwrite ./config/database.js // every property i don't define here will use ./config/database.js as a fallback

const { parse } = require("pg-connection-string");
module.exports = ({ env }) => {
  // env(envVarName, DefaultValue)
  const { host, port, database, user, password } = parse(
    env("RENDER_POSTGRESQL_INTERNAL_DATABASE_URL")
  );
  return {
    connection: {
      client: "postgres",
      connection: {
        host,
        port,
        database,
        user,
        password,
      },
      debug: false,
    },
  };
};
