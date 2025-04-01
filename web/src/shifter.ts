import { Month } from "../../shared/time.ts";
import { View, ViewShift } from "./view.ts";
import * as html from "./html.ts";

function monthToReadable(month: Month): string {
    const human = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
    ];
    return human[month];
}

type ShifterOpts = {
    container: HTMLElement;
    view: View;
};

type ShifterSetting = {
    container: HTMLElement;
    back: HTMLButtonElement;
    forward: HTMLButtonElement;
};

export class Shifter {
    private view: View;

    private constructor({ view, container }: ShifterOpts) {
        this.view = view;
        this.renderShifter(container);
    }

    private createSetting(name: string, display: string): ShifterSetting {
        const container = html.div(name);
        const back = html.button();
        back.textContent = "<";
        const forward = html.button();
        forward.textContent = ">";
        const value = html.span();
        value.textContent = display;
        container.append(back, " ", value, " ", forward);
        return { container, forward, back };
    }

    private renderShifter(container: HTMLElement) {
        const month = this.createSetting(
            "month",
            `${monthToReadable(this.view.month)}, ${this.view.year}`,
        );

        const focus = this.createSetting(
            "focus",
            this.view.focus ? `d. ${this.view.focus}` : "alle dage",
        );

        const events: [HTMLButtonElement, ViewShift][] = [
            [month.back, "month_back"],
            [month.forward, "month_forward"],
            [focus.back, "focus_back"],
            [focus.forward, "focus_forward"],
        ];

        for (const [element, shift] of events) {
            element.addEventListener("click", () => {
                this.view.shift(shift);
            });
        }

        container.replaceChildren(month.container, focus.container);
    }

    static render(opts: ShifterOpts) {
        new Shifter(opts);
    }
}
