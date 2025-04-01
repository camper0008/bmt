import { Day, Month } from "../shared/time.ts";

export interface Db {
    get(year: number, month: Month): Promise<Day[] | null>;
    set(year: number, month: Month, days: Day[]): Promise<void>;
}
