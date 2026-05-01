import type {NS} from '@ns';
import getServerPaths from "/data/get/serverPaths.js";

/** @param {NS} ns */
export async function main(ns: NS) {
    const list = getServerPaths(ns);
    for (const path of Object.values(list)) {
        ns.tprint(['home', ...path].reverse().join(' <- '));
    }
}
