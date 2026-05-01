import type {NS, Server} from '@ns';

/** @param {NS} ns */
export default function getServers(ns: NS): { [serverName: string]: Server } {
    return JSON.parse(ns.read('data/servers.json.txt'));
}
