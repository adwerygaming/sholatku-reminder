import { DatabaseTables } from "sholatku-reminder-shared/types/Database.types.js";
import DatabaseClient from "./DatabaseClient.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function createKnexAdapter() {
    const knex = DatabaseClient
    return {
        async create<D>({ model, data }: { model: string; data: Record<string, D> }): Promise<DatabaseTables> {
            const [row] = await knex(model).insert(data).returning('*');
            return row;
        },

        async findOne<D>({ model, where }: { model: string; where: Record<string, D> }): Promise<DatabaseTables | undefined> {
            return knex(model)?.where(where)?.first() ?? null;
        },

        async findMany<D>({ model, where }: { model: string; where?: Record<string, D> }): Promise<DatabaseTables[]> {
            const q = knex(model);
            if (where) q.where(where);
            return q;
        },

        async update<W, U>({
            model,
            where,
            update,
        }: {
            model: string;
            where: Record<string, W>;
            update: Record<string, U>;
        }): Promise<DatabaseTables | null> {
            const [row] = await knex(model).where(where).update(update).returning('*');
            return row ?? null;
        },

        async delete<W>({ model, where }: { model: string; where: Record<string, W> }): Promise<void> {
            await knex(model).where(where).delete();
        },
    };
}
