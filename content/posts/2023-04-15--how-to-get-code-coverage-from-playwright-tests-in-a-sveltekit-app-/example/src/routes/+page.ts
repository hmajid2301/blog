import type { LoadEvent } from "@sveltejs/kit";

export function load(event: LoadEvent) {
    const data = {
        initial: 5,
    };
    return data;
}
