import * as html from "./html.ts";
import { Day } from "../../shared/time.ts";
import { View } from "./view.ts";

class Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static fromHex(hex: `#${string}`): Color {
        const content = hex.slice(1);
        const r = parseInt(content.slice(0, 2), 16);
        const g = parseInt(content.slice(2, 4), 16);
        const b = parseInt(content.slice(4, 6), 16);
        return new Color(r, g, b);
    }

    toHex(): `#${string}` {
        const rgb = [this.r, this.g, this.b];
        const hex = rgb
            .map((v) => v.toString(16))
            .map((v) => v.padStart(2, "0"))
            .join("");
        return `#${hex}`;
    }

    static lerp(from: Color, to: Color, alpha: number): Color {
        function lerp(start: number, end: number, alpha: number) {
            return Math.round(start + ((end - start) * alpha));
        }
        return new Color(
            lerp(from.r, to.r, alpha),
            lerp(from.g, to.g, alpha),
            lerp(from.b, to.b, alpha),
        );
    }

    static manic = Color.fromHex("#83290B");
    static mildManic = Color.fromHex("#F38B68");
    static regular = Color.fromHex("#E09515");
    static mildDepressed = Color.fromHex("#AB9AC1");
    static depressed = Color.fromHex("#463659");
}

function colorFor(mood: number): Color {
    const fields = [
        [6, Color.manic, Color.mildManic],
        [7, Color.mildManic, Color.regular],
        [8, Color.regular, Color.mildDepressed],
        [15, Color.mildDepressed, Color.depressed],
    ] as const;

    let previous = 0;
    for (const [max, from, to] of fields) {
        if (mood >= max) {
            previous = max;
            continue;
        }
        const alpha = (mood - previous) / (max - previous);
        return Color.lerp(from, to, alpha);
    }
    throw new Error(`unreachable: invalid mood step '${mood}'`);
}

type TrackerOpts = {
    view: View;
    container: HTMLElement;
};

type PromptResponse<T> =
    | { tag: "cancelled" | "cleared" }
    | { tag: "cleared" }
    | { tag: "value"; value: T };

function promptText<T>(
    message: string,
    value: T | null,
): PromptResponse<string> {
    const defaultPrompt = value ?? "";
    const score = prompt(message, defaultPrompt.toString())?.trim();
    if (score === undefined) return { tag: "cancelled" };
    if (score === "") return { tag: "cleared" };
    return { tag: "value", value: score };
}

function promptScore(
    message: string,
    value: number | null,
): PromptResponse<number> {
    const res = promptText(message, value);
    if (res.tag !== "value") return res;
    const score = res.value;
    const intScore = parseInt(score);
    if (isNaN(intScore)) {
        alert(`'${score}' er ikke et gyldigt tal`);
        return { tag: "cancelled" };
    }

    return { tag: "value", value: intScore };
}

export class Tracker {
    private view: View;
    private days: Day[];

    private constructor(view: View, days: Day[], container: HTMLElement) {
        this.days = days;
        this.view = view;
        this.renderMonth(view.filterDays(this.days), container);
    }

    static async render(opts: TrackerOpts): Promise<void> {
        const days = await opts.view.days();
        new Tracker(opts.view, days, opts.container);
    }

    private renderMonth(days: Day[], container: HTMLElement) {
        const children = days
            .map((day) => this.renderDay(day));
        container.replaceChildren(...children);
    }

    private export() {
        this.view.exportDays(this.days);
    }

    private renderMoodScale(day: Day): HTMLElement[] {
        const scale = [];
        for (let mood = 0; mood < 15; ++mood) {
            const element = html.span("i-check", "mood");
            element.style.backgroundColor = colorFor(mood).toHex();
            if (day.checks.includes(mood)) {
                element.textContent = "x";
            }
            element.addEventListener("click", () => {
                const found = day.checks.indexOf(mood);
                if (found !== -1) {
                    day.checks.splice(found, 1);
                    element.textContent = " ";
                } else {
                    day.checks.push(mood);
                    element.textContent = "x";
                }
                this.export();
            });
            scale.push(element);
        }
        return scale;
    }

    private renderDay(day: Day): HTMLElement {
        const container = html.div("day");
        const count = html.span("count");
        count.textContent = day.date.toString();

        const moodScale = this.renderMoodScale(day);

        const anxiety = html.span("i-text");
        anxiety.textContent = day.anxiety?.toString() ?? "";
        anxiety.addEventListener("click", () => {
            const score = promptScore("Angst?", day.anxiety);
            if (score.tag === "cancelled") return;
            switch (score.tag) {
                case "cleared":
                    day.anxiety = null;
                    break;
                case "value":
                    if (!(score.value >= 0 && score.value <= 3)) {
                        return alert(`'${score.value}' er ikke mellem 0 og 3`);
                    }
                    day.anxiety = score.value;
                    break;
            }
            anxiety.textContent = day.anxiety?.toString() ?? "";
            this.export();
        });
        const sleep = html.span("i-text");
        sleep.textContent = day.hoursSlept?.toString() ?? "";
        sleep.addEventListener("click", () => {
            const score = promptScore("Timer sovet?", day.hoursSlept);
            if (score.tag === "cancelled") return;
            switch (score.tag) {
                case "cleared":
                    day.hoursSlept = null;
                    break;
                case "value":
                    day.hoursSlept = score.value;
                    break;
            }
            sleep.textContent = day.hoursSlept?.toString() ?? "";
            this.export();
        });

        const comment = html.span("i-text");

        comment.textContent = day.comment ? "x" : "";
        comment.title = day.comment ?? "";
        comment.addEventListener("click", () => {
            if (day.comment) {
                const editing = confirm(
                    `Kommentar:\n  '${day.comment}'\n\nRediger?`,
                );
                if (!editing) return;
            }
            const score = promptText("Kommentar?", day.comment);
            if (score.tag === "cancelled") return;
            switch (score.tag) {
                case "cleared":
                    day.comment = null;
                    comment.textContent = "";
                    break;
                case "value":
                    day.comment = score.value;
                    comment.textContent = "x";
                    break;
            }
            comment.title = day.comment ?? "";
            this.export();
        });

        container.append(
            count,
            ...moodScale,
            html.span("spacer"),
            anxiety,
            sleep,
            comment,
        );
        return container;
    }
}
