import type {NS} from '@ns';
import serverNames from '/data/get/serverNames.js';

export async function main(ns: NS) {
    const list = serverNames(ns);
    for (const server of list) {
        ns.tprint(server)
    }
}
