import { Tracker } from "./tracker.ts";
import { Day } from "../../time_repr/mod.ts";

function main() {
    const container = document.querySelector<HTMLElement>("#content");
    if (!container) {
        throw new Error("unreachable: defined in index.html");
    }
    const month: Day[] = [];
    for (let date = 1; date <= 30; ++date) {
        month.push({ date, anxiety: null, hoursSlept: null, checks: [] });
    }

    new Tracker({ month, container });
}

main();
