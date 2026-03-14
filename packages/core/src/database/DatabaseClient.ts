import Knex from "knex";
import { env } from "sholatku-reminder-core/src/utils/EnvManager";
import type { DatabaseTables } from "sholatku-reminder-shared/types/Database.types.js";

const DatabaseClient = Knex<DatabaseTables>({
  client: 'pg',
  connection: env.PG_CONNECTION_STRING,
});

export default DatabaseClient