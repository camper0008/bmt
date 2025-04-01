import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { Day, Month } from "../shared/time.ts";
import { ExportReq, ExportRes, ImportReq, ImportRes } from "../shared/api.ts";
import { Db } from "./db.ts";
import { FileDb } from "./file_db.ts";

export type Config = {
    port: number;
    hostname: string;
};

async function configFromFile(path: string): Promise<Config | null> {
    try {
        return JSON.parse(await Deno.readTextFile(path));
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
        return null;
    }
}

function daysInMonth(year: number, month: Month): number {
    const date = new Date(year, month);
    let days = 0;
    while (date.getMonth() === month) {
        date.setDate(date.getDate() + 1);
        days += 1;
    }
    return days;
}

async function imp({ year, month }: ImportReq, db: Db): Promise<ImportRes> {
    const existing = await db.get(year, month);
    if (existing !== null) {
        return { days: existing };
    }
    const totalDays = daysInMonth(year, month);
    const days: Day[] = [];
    for (let date = 1; date <= totalDays; ++date) {
        days.push({
            date,
            anxiety: null,
            hoursSlept: null,
            comment: null,
            checks: [],
        });
    }
    return { days };
}

async function exp(
    { year, month, days }: ExportReq,
    db: Db,
): Promise<ExportRes> {
    await db.set(year, month, days);
    return { ok: true };
}

async function listen({ port, hostname }: Config) {
    const routes = new Router();
    const db: Db = await FileDb.create();

    routes.post("/import", async (ctx) => {
        const body: ImportReq = await ctx.request.body.json();
        ctx.response.body = await imp(body, db);
    });

    routes.post("/export", async (ctx) => {
        const body: ExportReq = await ctx.request.body.json();
        ctx.response.body = await exp(body, db);
    });

    const app = new Application();
    app.use(oakCors());
    app.use(routes.routes());
    app.use(routes.allowedMethods());

    app.addEventListener("listen", ({ port, hostname }) => {
        console.log(`listening on ${hostname},`, port);
    });

    await app.listen({ port, hostname });
}

if (import.meta.main) {
    const configPath = "conf.json";
    const config = await configFromFile(configPath);
    if (!config) {
        console.error(`error: could not find config at '${configPath}'`);
        Deno.exit(1);
    }
    await listen(config);
}
