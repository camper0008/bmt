export function button(...classList: string[]): HTMLButtonElement {
    const element = document.createElement("button");
    element.classList.add(...classList);
    return element;
}

export function div(...classList: string[]): HTMLDivElement {
    const element = document.createElement("div");
    element.classList.add(...classList);
    return element;
}

export function span(...classList: string[]): HTMLSpanElement {
    const element = document.createElement("span");
    element.classList.add(...classList);
    return element;
}

export function query<T extends HTMLElement = HTMLElement>(
    query: string,
): HTMLElement {
    const element = document.querySelector<T>(query);
    if (!element) {
        throw new Error(
            `unreachable: element matching query '${query}' defined in index.html`,
        );
    }
    return element;
}
