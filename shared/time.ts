export enum Month {
    Jan,
    Feb,
    Mar,
    Apr,
    May,
    Jun,
    Jul,
    Aug,
    Sep,
    Oct,
    Nov,
    Dec,
}

export type Day = {
    readonly date: number;
    checks: number[];
    anxiety: number | null;
    hoursSlept: number | null;
    comment: string | null;
};
