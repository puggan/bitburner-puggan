import type {NS, Server} from '@ns';
import getServerNames from '/data/get/serverNames.js';

/** @param {NS} ns */
export function main(ns: NS) {
    const servers: { [serverName: string]: Server } = {};
    for (const serverName of getServerNames(ns)) {
        servers[serverName] = ns.getServer(serverName)
    }
    ns.write('data/servers.json.txt', JSON.stringify(servers, null, 2), 'w');
}
