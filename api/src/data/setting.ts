import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from 'schema';

export type DbSetting = {
    id: number;
    key: string;
    value: string;
};

export default class SettingRepository {
    private db: DrizzleD1Database<Record<string, never>>;

    constructor(db: DrizzleD1Database<Record<string, never>>) {
        this.db = db;
    }

    async get(key: string): Promise<DbSetting | undefined> {
        return await this.db.select().from(schema.Settings).where(eq(schema.Settings.key, key)).get();
    }

    async set(key: string, value: string): Promise<void> {
        const existingSetting = await this.get(key);
        if (existingSetting) {
            await this.db.update(schema.Settings)
                .set({ value })
                .where(eq(schema.Settings.key, key));
        } else {
            await this.db.insert(schema.Settings)
                .values({ key, value });
        }
    }

    async delete(key: string): Promise<void> {
        await this.db.delete(schema.Settings).where(eq(schema.Settings.key, key));
    }

}