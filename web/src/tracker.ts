import * as html from "./html.ts";
import { Day } from "../../time_repr/mod.ts";

type Rgb = [number, number, number];

function moodColor(step: number): Rgb {
    function fromHex(hex: `#${string}`): Rgb {
        const content = hex.slice(1);
        const r = parseInt(content.slice(0, 2), 16);
        const g = parseInt(content.slice(2, 4), 16);
        const b = parseInt(content.slice(4, 6), 16);
        return [r, g, b];
    }
    function lerp(start: number, end: number, alpha: number) {
        return start + ((end - start) * alpha);
    }

    const manic: Rgb = fromHex("#83290B");
    const mildManic: Rgb = fromHex("#F38B68");
    const regular: Rgb = fromHex("#E09515");
    const mildDepressed: Rgb = fromHex("#AB9AC1");
    const depressed: Rgb = fromHex("#463659");

    const fields = [
        [6, manic, mildManic],
        [7, mildManic, regular],
        [8, regular, mildDepressed],
        [15, mildDepressed, depressed],
    ] as const;

    let previous = 0;
    for (const [max, from, to] of fields) {
        if (step >= max) {
            previous = max;
            continue;
        }
        const alpha = (step - previous) / (max - previous);

        return [
            lerp(from[0], to[0], alpha),
            lerp(from[1], to[1], alpha),
            lerp(from[2], to[2], alpha),
        ];
    }
    throw new Error("unreachable");
}

type TrackerOpts = {
    month: Day[];
    container: HTMLElement;
};

export class Tracker {
    private month: Day[];

    constructor({ month, container }: TrackerOpts) {
        this.month = month;
        this.renderMonth(container);
    }

    private renderMonth(container: HTMLElement) {
        const children = this.month.map((day) => this.renderDay(day));
        container.replaceChildren(...children);
    }

    private renderDay(day: Day): HTMLElement {
        const container = html.div("day");
        const count = html.span("count");
        count.textContent = day.date.toString();

        const moods = [];
        for (let step = 0; step < 15; ++step) {
            const element = html.span("i-check", "mood");
            const color = moodColor(step);
            element.style.backgroundColor = `rgb(${color[0]},${color[1]},${
                color[2]
            })`;
            if (day.checks.includes(step)) {
                element.textContent = "x";
            }
            element.addEventListener("click", () => {
                const found = day.checks.indexOf(step);
                if (found !== -1) {
                    day.checks.splice(found, 1);
                    element.textContent = " ";
                } else {
                    day.checks.push(step);
                    element.textContent = "x";
                }
            });
            moods.push(element);
        }

        const spacer = html.span("spacer");
        const anxiety = html.span("i-text");
        if (day.anxiety !== null) {
            anxiety.textContent = day.anxiety.toString();
        }
        anxiety.addEventListener("click", () => {
            const defaultPrompt = day.anxiety !== null
                ? day.anxiety.toString()
                : undefined;
            const score = prompt("Angst?:", defaultPrompt)?.trim();
            if (score === undefined) return;
            if (score === "") {
                day.anxiety = null;
                anxiety.textContent = "";
                return;
            }
            const intScore = parseInt(score);
            if (!(intScore >= 0 && intScore <= 3)) {
                alert(`'${score}' er ikke mellem 0 og 3`);
                return;
            }
            day.anxiety = intScore;
            anxiety.textContent = day.anxiety.toString();
        });
        const sleep = html.span("i-text");
        sleep.addEventListener("click", () => {
            const defaultPrompt = day.hoursSlept !== null
                ? day.hoursSlept.toString()
                : undefined;
            const score = prompt("Søvn?:", defaultPrompt)?.trim();
            if (score === undefined) return;
            if (score === "") {
                day.hoursSlept = null;
                sleep.textContent = "";
                return;
            }
            const intScore = parseInt(score);
            if (isNaN(intScore)) {
                alert(`'${score}' er ikke et gyldigt tal`);
            }
            day.hoursSlept = intScore;
            sleep.textContent = day.hoursSlept.toString();
        });

        container.append(
            count,
            ...moods,
            spacer,
            anxiety,
            sleep,
        );
        return container;
    }
}
