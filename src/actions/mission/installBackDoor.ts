import {NS} from '@ns';
import getServerCategories from "/data/get/serverCategories";
import {runAndWait} from "/data/generate/all";

const prioServer = [
    'w0r1d_d43m0n',
    'run4theh111z',
    'I.I.I.I',
    'avmnite-02h',
    'CSEC',
];

function nextTarget(ns: NS) {
    const servers = getServerCategories(ns);
    for (const serverName of prioServer) {
        if (!servers.missingBackDoor[serverName]) {
            continue;
        }
        const server = servers.missingBackDoor[serverName];
        if (!server.hasAdminRights) {
            continue;
        }
        return server;
    }
    for (const server of Object.values(servers.missingBackDoor)) {
        if (server.hasAdminRights) {
            return server;
        }
    }
    return null;
}

/** @param {NS} ns */
export async function main(ns: NS) {
    const target = nextTarget(ns);
    if (!target) {
        return;
    }
    await runAndWait(ns, '/actions/single/travel.js', target.hostname);
    ns.spawn('/actions/single/installBackdoor.js');
}
