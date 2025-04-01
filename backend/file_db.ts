import { Day, Month } from "../shared/time.ts";
import { Db } from "./db.ts";

function toHuman(month: Month): string {
    const monthNumber = month + 1;
    return monthNumber.toString().padStart(2, "0");
}

export class FileDb implements Db {
    private constructor() {
    }
    async get(year: number, month: Month): Promise<Day[] | null> {
        try {
            const content = await Deno.readTextFile(
                `db_data/${year}-${toHuman(month)}.json`,
            );
            return JSON.parse(content);
        } catch (error) {
            if (!(error instanceof Deno.errors.NotFound)) {
                throw error;
            }
            return null;
        }
    }
    async set(year: number, month: Month, days: Day[]): Promise<void> {
        await Deno.writeTextFile(
            `db_data/${year}-${toHuman(month)}.json`,
            JSON.stringify(days),
        );
    }

    static async create(): Promise<Db> {
        try {
            await Deno.mkdir("db_data");
        } catch (error) {
            if (!(error instanceof Deno.errors.AlreadyExists)) {
                throw error;
            }
        }
        return new FileDb();
    }
}
