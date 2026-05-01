import type {NS} from '@ns';

/** @param {NS} ns */
export default function getServerNeighbors(ns: NS): Record<string, string[]> {
    return JSON.parse(ns.read('data/serverNeighbors.json.txt'));
}