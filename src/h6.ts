import type {NS} from '@ns';

type scriptKeys = "hack" | "grow" | "weaken";
type actionKeys = scriptKeys | "other" | "multiple";

type serverInfo = {
    serverName: string;
    freeRam: number;
    usedRam: number;
    maxRam: number;
}

type serverTarget = {
    serverName: string;
    action: scriptKeys;
    threads: number;
    prio: number;
}

type serverAction = {
    serverName: string;
    action: actionKeys;
    threads: number;
    time: number;
}

/**
 * @param {number} ms
 * @return {string}
 **/
export function timeFormat(ms: number): string {
    if (isNaN(ms) || !ms) return '-'
    if (ms < 0) return '-' + timeFormat(-ms);
    if (ms < 2000) return Math.floor(ms / 100) / 10 + 's';
    const sec = Math.floor(ms / 1000);
    if (sec < 90) return sec + 's';
    const min = Math.floor(sec / 60);
    if (min < 90) return min + 'm';
    const hours = Math.floor(min / 60);
    if (hours < 48) return hours + 'h';
    return Math.floor(hours / 24) + 'd';
}

/**
 * @param {NS} ns
 * @param {string} serverName
 * @returns {number}
 **/
export function serverPrio(ns: NS, serverName: string): number {
    if (ns.getServerMaxMoney(serverName) <= 0) return 0;

    // Calculate weaken threads needed
    const weakenThreads = (
        (
            ns.hackAnalyzeSecurity(1 / ns.hackAnalyze(serverName)) +
            ns.growthAnalyzeSecurity(
                ns.growthAnalyze(serverName, 1 / 0.9)
            )
        ) / ns.weakenAnalyze(1)
    );

    // Calculate efficiency
    return (
        ns.getServerMaxMoney(serverName) /
        (
            (1 / ns.hackAnalyze(serverName)) * ns.getHackTime(serverName) +
            ns.growthAnalyze(serverName, 1 / 0.9) * ns.getGrowTime(serverName) +
            weakenThreads * ns.getWeakenTime(serverName)
        )
    );
}

/**
 * @param {NS} ns
 * @returns {{serverName: string, freeRam: number, usedRam: number, maxRam: number}[]}
 **/
export function serverMemoryList(ns: NS): serverInfo[] {
    const pLvl = ns.getHackingLevel();
    const fileContent = ns.read("rootList.txt") + "\r\nhome";
    const serverNames = fileContent.split("\r\n");
    const servers: serverInfo[] = [];
    for (const serverName of serverNames) {
        if (!serverName.length) continue;
        const server = ns.getServer(serverName);
        if (!server.hasAdminRights) {
            continue;
        }
        if (server.requiredHackingSkill && server.requiredHackingSkill > pLvl) {
            continue;
        }
        const maxRam = ns.getServerMaxRam(serverName);
        const usedRam = ns.getServerUsedRam(serverName);
        const freeRam = maxRam - usedRam;
        if (serverName === 'home') {
            const maxRamAllowed = maxRam < 128 ? maxRam * 0.75 : maxRam - 53;
            const freeRamAllowed = maxRamAllowed - usedRam;
            servers.push({serverName, freeRam: freeRamAllowed, usedRam, maxRam: maxRamAllowed} satisfies serverInfo);
        } else {
            servers.push({serverName, freeRam, usedRam, maxRam} satisfies serverInfo);
        }
    }
    return servers;
}

/**
 * @param {NS} ns
 * @param {boolean} verbose
 **/
export async function step(ns: NS, verbose: boolean) {
    ns.clearLog();
    const homeCores = ns.getServer("home").cpuCores;
    const scripts = {
        hack: 'hackOnce.js',
        grow: 'growOnce.js',
        weaken: 'weakenOnce.js',
        xp: 'weakenMultiple.js',
    } as const;

    // Initialize an empty object to store RAM per thread
    const ramPerThreadList: { [action: string]: number } = {};

    // Iterate over the scripts object and populate ramPerThreadList
    for (const action of Object.keys(scripts) as (keyof typeof scripts)[]) {
        ramPerThreadList[action] = ns.getScriptRam(scripts[action]);
    }

    const moneyServers = ns.read("moneyServers.txt").split("\r\n");
    const xpServer = 'foodnstuff';
    const weakenNormalPower = ns.weakenAnalyze(1);
    const weakenHomePower = ns.weakenAnalyze(1, homeCores);
    /** @var {{serverName: string, action: "weaken"|"grow"|"hack", threads: number, prio: number}[]} targets */
    const targets: serverTarget[] = [];
    for (const serverName of moneyServers) {
        const currentMoney = ns.getServerMoneyAvailable(serverName);
        if (currentMoney < 1) {
            continue;
        }

        const securityThresh = ns.getServerMinSecurityLevel(serverName);
        const weakenRequired = ns.getServerSecurityLevel(serverName) - securityThresh;

        const prio = serverPrio(ns, serverName);

        if (weakenRequired > 5) {
            targets.push(
                {
                    serverName,
                    action: 'weaken',
                    threads: weakenRequired / weakenNormalPower,
                    prio,
                }
            );
            continue;
        }

        const maxMoney = ns.getServerMaxMoney(serverName);

        targets.push(
            currentMoney < maxMoney * 0.95 ?
                {
                    serverName,
                    action: 'grow',
                    threads: ns.growthAnalyze(serverName, maxMoney / currentMoney),
                    prio,
                } :
                {
                    serverName,
                    action: 'hack',
                    threads: ns.hackAnalyzeThreads(serverName, currentMoney - 0.8 * maxMoney),
                    prio,
                }
        );
    }

    const actionPriority: { [action in scriptKeys]: number } = {"weaken": 2, "hack": 1, "grow": 0} as const;
    const validTargets = targets.filter(target => target.threads > 0);
    validTargets.sort(
        (a, b) => {
            return (b.prio - a.prio) ||
                (+(actionPriority[b.action] || 0) - +(actionPriority[a.action] || 0)) ||
                b.threads - a.threads;
        }
    );

    const timeStamp = Date.now();
    /** @var {Record<string, {serverName: string, action: "weaken"|"grow"|"hack", threads: number, time: number}>} currentActions */
    const currentActions: { [server: string]: serverAction } = {};
    for (const executingServerName of ['home', ...ns.getPurchasedServers(), ...moneyServers]) {
        for (const process of ns.ps(executingServerName)) {
            for (const argument of process.args) {
                const serverName = '' + argument;
                if (!moneyServers.includes(serverName)) {
                    continue;
                }
                let action: actionKeys = 'other';
                switch (process.filename) {
                    case scripts['hack']:
                        action = 'hack';
                        break;
                    case scripts['grow']:
                        action = 'grow';
                        break;
                    case scripts['weaken']:
                    case 'weakenMultiple.js':
                        action = 'weaken';
                        break;
                    default:
                        ns.tprintf('Unknown script: %s', process.filename);
                        ns.printf('Unknown script: %s', process.filename);
                }
                if (!currentActions[serverName]) {
                    currentActions[serverName] = {
                        serverName,
                        action,
                        threads: 0,
                        time:
                            (process.args.length == 2 && !isNaN(+process.args[1])) ? +process.args[1] :
                                (process.args.length == 3 && !isNaN(+process.args[2])) ? +process.args[2] :
                                    0,
                    }
                } else if (currentActions[serverName].action !== action) {
                    currentActions[serverName].action = 'multiple';
                }
                currentActions[serverName].threads += process.threads;
            }
        }
    }

    const serverRamList = serverMemoryList(ns);

    let scriptSkippedDueToLowMemory = false;
    for (const targetData of validTargets) {
        // TODO remove when done testing
        // if (targetData.action === 'hack') {
        // 	if(verbose) ns.printf("hack on %s skipped, testing", targetData.serverName);
        // 	continue;
        // }

        const scriptTime = {
            grow: ns.getGrowTime(targetData.serverName),
            hack: ns.getHackTime(targetData.serverName),
            weaken: ns.getWeakenTime(targetData.serverName),
        }[targetData.action];
        let threadsNeeded = targetData.threads;
        if (currentActions[targetData.serverName]) {
            if (currentActions[targetData.serverName].action !== 'weaken') {
                if (verbose) {
                    ns.printf(
                        "%s on %s skipped, already running %s (%s)",
                        targetData.action,
                        targetData.serverName,
                        currentActions[targetData.serverName].action,
                        currentActions[targetData.serverName].time ? timeFormat(currentActions[targetData.serverName].time - timeStamp) : '-'
                    );
                }
                continue;
            }
            if (targetData.action === 'weaken') {
                threadsNeeded -= currentActions[targetData.serverName].threads;
            }
        }
        if (threadsNeeded < 1) {
            if (targetData.threads < 1) {
                if (verbose) ns.printf("%s on %s skipped, no threads needed", targetData.action, targetData.serverName);
            } else {
                if (verbose) {
                    ns.printf(
                        "%s on %s skipped, enough threads already running (%s)",
                        targetData.action,
                        targetData.serverName,
                        currentActions[targetData.serverName].time ? timeFormat(currentActions[targetData.serverName].time - timeStamp) : '-'
                    );
                }
            }
            continue;
        }

        const ramPerThread = ramPerThreadList[targetData.action] || Infinity;
        let ramNeeded = ramPerThread * Math.ceil(threadsNeeded);
        let serversToUse = [];
        if (targetData.action !== 'weaken') {
            serversToUse = serverRamList.filter((server) => server.freeRam >= ramNeeded);
            if (serversToUse.length) {
                serversToUse.sort((a, b) => a.freeRam - b.freeRam);
                serversToUse = [serversToUse[0]];
            } else {
                if (!scriptSkippedDueToLowMemory) {
                    const posibleServers = serverRamList.filter((server) => server.maxRam >= ramNeeded);
                    if (posibleServers.length === 1 && posibleServers[0].serverName === 'home' && posibleServers[0].usedRam < posibleServers[0].freeRam) {
                        if (verbose) ns.printf("%s on %s almost skipped, no servers/RAM, just an unused home-server", targetData.action, targetData.serverName);
                    } else if (posibleServers.length > 0) {
                        scriptSkippedDueToLowMemory = true;
                        if (verbose) ns.printf("%s on %s skipped, no servers/RAM, waiting for %d servers like %s", targetData.action, targetData.serverName, posibleServers.length, posibleServers[0].serverName);
                        continue;
                    }
                }

                serversToUse = serverRamList.filter((server) => server.freeRam >= ramPerThread);
                if (serversToUse.length < 1) {
                    if (verbose) ns.printf("%s on %s skipped, no servers", targetData.action, targetData.serverName);
                    continue;
                }
                serversToUse.sort((a, b) => b.freeRam - a.freeRam);
                serversToUse = [serversToUse[0]];
            }
        } else {
            serversToUse = serverRamList.filter((server) => server.freeRam >= ramPerThread);
            if (serversToUse.length < 1) {
                if (threadsNeeded < targetData.threads) {
                    if (verbose) ns.printf("%s on %s skipped, limited RAM (%s)", targetData.action, targetData.serverName, timeFormat(currentActions[targetData.serverName].time - timeStamp));
                } else {
                    if (verbose) ns.printf("%s on %s skipped, no servers", targetData.action, targetData.serverName);
                }
                continue;
            }
            serversToUse.sort((a, b) => a.freeRam - b.freeRam);
        }

        if (scriptSkippedDueToLowMemory) {
            if (threadsNeeded < targetData.threads) {
                if (verbose) ns.printf("%s on %s skipped, RAM queue (%s)", targetData.action, targetData.serverName, timeFormat(currentActions[targetData.serverName].time - timeStamp));
            } else {
                if (verbose) ns.printf("%s on %s skipped, RAM queue", targetData.action, targetData.serverName);
            }
            continue;
        }

        let threadsExecuted = 0;
        for (const serverToUse of serversToUse) {
            if (threadsNeeded < 0) {
                break;
            }
            const threadsToUse = Math.min(Math.ceil(threadsNeeded), Math.floor(serverToUse.freeRam / ramPerThread));
            if (threadsToUse < 1) {
                continue;
            }
            if (serverToUse.serverName === 'home') {
                let threadOnHomeServer = threadsToUse;
                if (homeCores > 1 && targetData.action === 'grow') {
                    const growNormalPower = ns.growthAnalyze(targetData.serverName, 2);
                    const growHomePower = ns.growthAnalyze(targetData.serverName, 2, homeCores);
                    threadOnHomeServer = Math.min(Math.ceil(threadsNeeded * growNormalPower / growHomePower), threadsToUse);
                } else if (homeCores > 1 && targetData.action === 'weaken') {
                    threadOnHomeServer = Math.min(Math.ceil(threadsNeeded * weakenNormalPower / weakenHomePower), threadsToUse);
                }

                ns.exec(scripts[targetData.action], serverToUse.serverName, threadOnHomeServer, targetData.serverName, Date.now() + scriptTime);
            } else {
                ns.scp(scripts[targetData.action], serverToUse.serverName, 'home');
                ns.exec(scripts[targetData.action], serverToUse.serverName, threadsToUse, targetData.serverName, Date.now() + scriptTime);
            }
            serverToUse.usedRam = ns.getServerUsedRam(serverToUse.serverName);
            serverToUse.freeRam = serverToUse.maxRam - serverToUse.usedRam;
            threadsNeeded -= threadsToUse;
            threadsExecuted += threadsToUse;
        }
        if (threadsExecuted > 0) {
            if (verbose) ns.printf("%s on %s started on %d threads", targetData.action, targetData.serverName, threadsExecuted);
        } else {
            if (verbose) ns.printf("%s on %s skipped, ???", targetData.action, targetData.serverName);
        }
    }

    if (scriptSkippedDueToLowMemory) {
        return;
    }
    if (!moneyServers.includes(xpServer)) {
        return;
    }

    for (const server of serverRamList) {
        const unusedWeakensThreads = Math.floor(server.freeRam / ramPerThreadList.weaken);
        if (unusedWeakensThreads < 1) {
            continue;
        }
        if (server.serverName !== 'home') {
            ns.scp(scripts.xp, server.serverName, 'home');
        }
        ns.exec(scripts.xp, server.serverName, unusedWeakensThreads, xpServer, 10, Date.now());
    }
}

/** @param {NS} ns **/
export async function main(ns: NS) {
    const verbose = true;
    ns.disableLog("disableLog");
    ns.disableLog("exec");
    ns.disableLog("getHackingLevel");
    ns.disableLog("getScriptRam");
    ns.disableLog("getServerMaxMoney");
    ns.disableLog("getServerMaxRam");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("getServerMinSecurityLevel");
    ns.disableLog("getServerSecurityLevel");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("growthAnalyze");
    ns.disableLog("scp");
    ns.disableLog("sleep");
    ns.disableLog("weakenAnalyze");
    while (true) {
        ns.clearLog();
        await step(ns, verbose);
        await ns.sleep(1000);
    }
}