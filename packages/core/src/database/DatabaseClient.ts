import Knex from "knex";
import { DatabaseTables } from "sholatku-reminder-shared/types/Database.types.js";
import { env } from "../utils/EnvManager.js";

const DatabaseClient = Knex<DatabaseTables>({
  client: 'pg',
  connection: env.PG_CONNECTION_STRING,
});

export default DatabaseClient