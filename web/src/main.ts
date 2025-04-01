import { Client } from "./client.ts";
import { View } from "./view.ts";

function main() {
    const params = new URLSearchParams(location.search);
    const client = new Client("/api");
    View.fromSearchParams(params, client).render();
}

main();
