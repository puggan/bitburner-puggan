import type {NS} from '@ns';
import getServerNames from '/data/get/serverNames.js';

/** @param {NS} ns */
export async function main(ns: NS) {
    const list = getServerNames(ns);
    for (const server of list) {
        ns.tprint(server)
    }
}
