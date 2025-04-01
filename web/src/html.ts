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
