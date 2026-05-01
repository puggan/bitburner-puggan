import {NS} from '@ns';
import getServerPaths from "/data/get/serverPaths";

/**
 * @param {NS} ns
 * @param {string} host
 */
export function travel(ns: NS, host: string) {
    const servserPaths = getServerPaths(ns);
    if (!servserPaths[host]) {
        throw new Error(`No server path found for host: ${host}`);
    }
    ns.singularity.connect('home');
    for(const nextHop of servserPaths[host]) {
        ns.singularity.connect(nextHop);
    }
}

/** @param {NS} ns */
export function main(ns: NS) {
    if (ns.args.length !== 1) {
        throw new Error(`Argument host is missing`);
    }
    travel(ns, '' + ns.args[0]);
}
