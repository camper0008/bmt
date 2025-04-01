import { Day } from "../../shared/time.ts";
import { Client } from "./client.ts";
import { Shifter } from "./shifter.ts";
import { Tracker } from "./tracker.ts";
import * as html from "./html.ts";

function numberFromParams(
    params: URLSearchParams,
    key: string,
): number | null {
    const str = params.get(key);
    if (!str) return null;
    const parsed = parseInt(str);
    if (isNaN(parsed)) return null;
    return parsed;
}

export type ViewShift =
    | "month_back"
    | "month_forward"
    | "focus_back"
    | "focus_forward";

export class View {
    private date: Date;
    public focus: number | null;
    private client: Client;

    private constructor(date: Date, focus: number | null, client: Client) {
        this.date = date;
        this.focus = focus;
        this.client = client;
        this.render();
    }

    get year() {
        return this.date.getFullYear();
    }

    get month() {
        return this.date.getMonth();
    }

    async days(): Promise<Day[]> {
        const { days } = await this.client.import({
            year: this.year,
            month: this.month,
        });
        return days;
    }
    filterDays(days: Day[]): Day[] {
        if (this.focus) {
            return days.filter((day) => day.date === this.focus);
        }
        return days;
    }

    async exportDays(days: Day[]): Promise<void> {
        await this.client.export({
            year: this.year,
            month: this.month,
        }, days);
    }

    static fromSearchParams(params: URLSearchParams, client: Client): View {
        const viewing = new Date();

        let focus: number | null;
        if (params.get("focus") === "today") {
            focus = viewing.getDate();
        } else {
            focus = numberFromParams(params, "focus");
        }

        const year = numberFromParams(params, "year");
        if (year !== null) viewing.setFullYear(year);
        const month = numberFromParams(params, "month");
        if (month !== null) viewing.setMonth(month - 1);
        return new View(viewing, focus, client);
    }

    private toSearchParams(): URLSearchParams {
        const params = new URLSearchParams();
        const now = new Date();
        const diffYear = this.date.getFullYear() !== now.getFullYear();
        if (diffYear) {
            params.set("year", this.date.getFullYear().toString());
        }
        const diffMonth = diffYear || this.date.getMonth() !== now.getMonth();
        if (diffMonth) {
            params.set("month", (this.date.getMonth() + 1).toString());
        }
        if (this.focus) {
            params.set("focus", this.focus.toString());
        }
        return params;
    }

    render() {
        Tracker.render({ view: this, container: html.query("#content") });
        Shifter.render({ view: this, container: html.query("#shift") });

        const url = new URL(location.toString());
        url.search = this.toSearchParams().toString();
        history.pushState({}, "", url);
    }

    shift(shift: ViewShift): void {
        const focusBeforeShift = this.focus;
        const monthBeforeShift = this.date.getMonth();

        switch (shift) {
            case "month_back":
                this.date.setMonth(this.date.getMonth() - 1, 1);
                break;
            case "month_forward": {
                const month = this.date.getMonth();
                this.date.setMonth(month + 1, 1);
                break;
            }
            case "focus_back":
                if (this.focus !== null) {
                    this.date.setDate(this.date.getDate() - 1);
                }
                break;
            case "focus_forward":
                if (this.focus !== null) {
                    this.date.setDate(this.date.getDate() + 1);
                }
                break;
        }

        if (["focus_forward", "focus_back"].includes(shift)) {
            this.focus = this.date.getDate();
        } else {
            this.focus = null;
            const now = new Date();
            const viewingCurrentMonth =
                this.date.getFullYear() === now.getFullYear() &&
                this.date.getMonth() === now.getMonth();
            if (viewingCurrentMonth) {
                this.date.setDate(now.getDate());
            } else {
                this.date.setDate(1);
            }
        }
        if (
            monthBeforeShift !== this.month ||
            focusBeforeShift !== this.focus
        ) {
            this.render();
            return;
        }
    }
}
