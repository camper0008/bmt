import { Client } from "./client.ts";
import { View } from "./view.ts";

function main() {
    const params = new URLSearchParams(location.search);
    const client = new Client("http://10.0.0.18:8000");
    View.fromSearchParams(params, client).render();
}

main();
