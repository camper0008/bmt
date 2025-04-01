import { Day, Month } from "./time.ts";

export type ImportReq = {
    year: number;
    month: Month;
};

export type ImportRes = {
    days: Day[];
};

export type ExportReq = {
    year: number;
    month: Month;
    days: Day[];
};

export type ExportRes = {
    ok: true;
};
