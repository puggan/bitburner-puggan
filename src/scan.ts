import {NS} from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
    const servers: string[] = [];
    const todo = ['home'];
    const servers2hack = [];
    const rootedServers = [];
    const moneyServers = [];
    const myServers = [];
    const unreachableServers = [];
    const paths = {
        home: '(home)',
    };
    while (todo.length > 0) {
        const nextServer = todo.pop();
        if (servers.includes(nextServer)) {
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
                paths[sibling] = sibling + '* <- ' + paths[nextServer];
            } else {
                paths[sibling] = sibling + ' <- ' + paths[nextServer];
            }
        }
    }
    const pLvl = ns.getHackingLevel();
    const portTools = [
        ns.fileExists("BruteSSH.exe", "home"),
        ns.fileExists("FTPCrack.exe", "home"),
        ns.fileExists("relaySMTP.exe", "home"),
        ns.fileExists("HTTPWorm.exe", "home"),
        ns.fileExists("SQLInject.exe", "home"),
    ];
    const maxPorts = portTools.filter(b => b).length;
    let missingPorts = 0;
    let missingLevel = 0;
    let nextLevel = Infinity;
    for (const serverName of servers) {
        if (serverName === 'home') {
            continue;
        }
        const server = ns.getServer(serverName);
        if (server.purchasedByPlayer) {
            // ns.tprint('owned@' + serverName);
            myServers.push(serverName);
            rootedServers.push(serverName);
            continue;
        }
        if (server.backdoorInstalled) {
            // ns.tprint('root@' + serverName);
            rootedServers.push(serverName);
        } else {
            if (server.numOpenPortsRequired > maxPorts) {
                missingPorts++;
                //ns.tprint('missing-ports-' + server.numOpenPortsRequired + '@' + serverName);
                continue;
            }
            if (!server.hasAdminRights) {
                if (portTools[0] && !server.sshPortOpen) {
                    ns.brutessh(serverName);
                }
                if (portTools[1] && !server.ftpPortOpen) {
                    ns.ftpcrack(serverName);
                }
                if (portTools[2] && !server.smtpPortOpen) {
                    ns.relaysmtp(serverName);
                }
                if (portTools[3] && !server.httpPortOpen) {
                    ns.httpworm(serverName);
                }
                if (portTools[4] && !server.sqlPortOpen) {
                    ns.sqlinject(serverName);
                }
                ns.nuke(serverName);
            }
            rootedServers.push(serverName);
            if (server.requiredHackingSkill > pLvl) {
                unreachableServers.push({lvl: server.requiredHackingSkill, serverName});
                missingLevel++;
                nextLevel = Math.min(nextLevel, server.requiredHackingSkill);
                // ns.tprint('lvl-' + server.requiredHackingSkill + '@' + serverName);
                continue;
            }
            // ns.tprint('backdoor@' + serverName + ', ' + paths[serverName]);
        }
        servers2hack.push(serverName);
        if (ns.getServerMoneyAvailable(serverName)) {
            moneyServers.push(serverName);
        }
    }
    unreachableServers.sort((a, b) => b.lvl - a.lvl || a.serverName.localeCompare(b.serverName));
    await ns.write("serverList.txt", servers2hack.join("\r\n"), 'w');
    await ns.write("rootList.txt", rootedServers.join("\r\n"), 'w');
    await ns.write("moneyServers.txt", moneyServers.join("\r\n"), 'w');
    await ns.write("unreachableServers.txt", unreachableServers.map((s) => s.lvl + ": " + s.serverName).join("\r\n"), 'w');
    await ns.write("paths.json.txt", JSON.stringify(paths, null, 2), 'w');
    ns.tprint("Backdoors: " + servers2hack.length + ", missing ports: " + missingPorts + ", missing levels: " + missingLevel);
    if (missingLevel) {
        ns.tprint("Next target at " + nextLevel);
        await ns.write("lvl.txt", nextLevel, 'w');
    } else {
        await ns.write("lvl.txt", "-", 'w');
    }
    const globalFiles = [
        "serverList.txt",
        "rootList.txt",
        "moneyServers.txt",
        "weakenOnce.js",
        "growOnce.js",
        "hackOnce.js",
    ];
    for (const serverName of myServers) {
        await ns.scp(globalFiles, serverName);
    }
}