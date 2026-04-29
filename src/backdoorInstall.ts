import {NS} from '@ns';

export function connectionChain(ns: NS, hopes: string[]) {
    for (const hop of hopes) {
        ns.tprintf('Hop %s', hop);
        if (!ns.singularity.connect(hop)) {
            ns.tprintf('Failed Hop %s', hop);
            return false;
        }
    }
    return true;
}

export function list(ns: NS) {
    const pLvl = ns.getHackingLevel();
    const todo = ['home'];
    const paths: { [server: string]: string[] } = {'home': ['home']};
    const servers: string[] = [];
    const missingBackDoor: string[] = [];
    const prioBackdoors = [
        'w0r1d_d43m0n',
        'run4theh111z',
        'I.I.I.I',
        'avmnite-02h',
        'CSEC',
    ];
    while (todo.length > 0) {
        const nextServer = todo.pop();
        if (!nextServer || servers.includes(nextServer)) {
            continue;
        }
        servers.push(nextServer);
        const siblings = ns.scan(nextServer);
        for (const sibling of siblings) {
            if (servers.includes(sibling)) {
                continue;
            }
            if (todo.includes(sibling)) {
                continue;
            }
            todo.push(sibling);
            const server = ns.getServer(sibling);
            if (server.backdoorInstalled) {
                paths[sibling] = [sibling];
                continue
            }
            paths[sibling] = [...paths[nextServer], sibling];
            if (server.purchasedByPlayer) continue;
            if (server.requiredHackingSkill && server.requiredHackingSkill > pLvl) continue;
            if (!server.hasAdminRights) continue;

            missingBackDoor.push(sibling);
        }
    }
    const sortedMissingBackDoors = [
        ...prioBackdoors.filter(s => missingBackDoor.includes(s)),
        ...missingBackDoor.filter(s => !prioBackdoors.includes(s)),
    ];
    return {paths, sortedMissingBackDoors};
}

export async function backdoor(ns: NS, attacked: number) {
    const {paths, sortedMissingBackDoors} = list(ns);
    if (sortedMissingBackDoors.length === 0) {
        return false;
    }
    const serverCount = attacked + sortedMissingBackDoors.length;
    const attackedServer = sortedMissingBackDoors[0];
    ns.tprintf('[%s] Chain connection to %s', new Date().toLocaleTimeString('en-SE'), attackedServer);
    if (connectionChain(ns, paths[attackedServer])) {
        const installTimeMs = ns.getHackTime(attackedServer) / 4;
        const etaDate = new Date(Date.now() + installTimeMs).toLocaleString('en-SE');
        ns.tprintf('[%s] Installing backdoor at %s (%d/%d), ETA %s', new Date().toLocaleTimeString('en-SE'), attackedServer, attacked, serverCount, etaDate);
        await ns.singularity.installBackdoor();
        ns.tprintf('[%s] Installed backdoor at %s (%d/%d)', new Date().toLocaleTimeString('en-SE'), attackedServer, attacked, serverCount);
        return true;
    }

    return false;
}

/** @param {NS} ns */
export async function main(ns: NS) {
    let attacks = 0;
    while (await backdoor(ns, attacks)) {
        attacks++;
        await ns.sleep(1000);
    }
    ns.singularity.connect('home');
    ns.tprintf('[%s] All backdoors Installed', new Date().toLocaleTimeString('en-SE'));
}