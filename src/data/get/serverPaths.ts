import type {NS} from '@ns';

/** @param {NS} ns */
export default function getServerPaths(ns: NS): Record<string, string[]> {
    return JSON.parse(ns.read('data/serverPaths.json.txt'));
}