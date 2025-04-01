import {
    ExportReq,
    ExportRes,
    ImportReq,
    ImportRes,
} from "../../shared/api.ts";
import { Day, Month } from "../../shared/time.ts";
import { View } from "./view.ts";

type YearAndMonth = {
    year: number;
    month: Month;
};

export class Client {
    private apiUrl: string;

    constructor(
        apiUrl: typeof this.apiUrl,
    ) {
        this.apiUrl = apiUrl;
    }

    async import(date: YearAndMonth): Promise<ImportRes> {
        const req: ImportReq = {
            ...date,
        };
        return await fetch(`${this.apiUrl}/import`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
        }).then((response) => response.json());
    }

    async export(date: YearAndMonth, days: Day[]): Promise<ExportRes> {
        const req: ExportReq = {
            ...date,
            days,
        };
        return await fetch(`${this.apiUrl}/export`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
        }).then((response) => response.json());
    }
}
