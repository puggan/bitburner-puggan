import type {NS} from '@ns';

type scriptKeys = "hack" | "grow" | "weaken";
type scriptNumbers = {
    [script in scriptKeys]: number;
}
type scriptTotals = { total: number } & scriptNumbers;

/** @param {NS} ns */
export async function step(ns: NS) {
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getServerMinSecurityLevel');
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('getServerMaxMoney');
    ns.clearLog();
    /** @type {string} fileContent */
    const fileContent = ns.read("moneyServers.txt");
    /** @type {{
     *   server: string,
     *   serverMoney: number,
     *   serverMaxMoney: number,
     *     additionalSecurityLevel: number,
     *   threads: {
     *     hack: number,
     *     grow: number,
     *     weaken: number,
     *   }
     * }[]} goldMines */
    const goldMines = [];
    for (const server of fileContent.split("\r\n")) {
        if (server.length < 1 || server.startsWith('#')) {
            continue;
        }
        const serverMoney = ns.getServerMoneyAvailable(server);
        const serverMaxMoney = ns.getServerMaxMoney(server);
        if (serverMoney < 1) {
            if (serverMaxMoney > 0) {
                ns.print(server + ': broken (' + ns.nFormat(serverMaxMoney, "0 a") + ')');
            }
            continue;
        }
        const additionalSecurityLevel = ns.getServerSecurityLevel(server) - ns.getServerMinSecurityLevel(server);
        const profit = ns.hackAnalyze(server);
        const hackThreads = Math.floor(0.45 / profit);
        const growThreads = ns.growthAnalyze(server, 2);
        const increasedThreat = ns.hackAnalyzeSecurity(hackThreads, server) + ns.growthAnalyzeSecurity(growThreads, server, 1);
        const reducedSecurity = ns.weakenAnalyze(1);
        const threads: scriptNumbers = {
            hack: hackThreads,
            grow: growThreads,
            weaken: Math.ceil(increasedThreat / reducedSecurity),
        };
        const msRawTimes: scriptNumbers | scriptTotals = {
            hack: ns.getHackTime(server),
            grow: ns.getGrowTime(server),
            weaken: ns.getWeakenTime(server),
        };
        const msTimes = {total: msRawTimes.hack + msRawTimes.grow + msRawTimes.weaken, ...msRawTimes};
        const times: scriptNumbers = {
            hack: Math.ceil(msTimes.hack / 60000),
            grow: Math.ceil(msTimes.grow / 60000),
            weaken: Math.ceil(msTimes.weaken / 60000),
        };
        goldMines.push({server, serverMoney, serverMaxMoney, additionalSecurityLevel, threads, times, msTimes});
    }
    const sortedGoldMines = goldMines.sort(
        (a, b) =>
            (
                b.serverMaxMoney / (
                    b.msTimes.hack * b.threads.hack
                    + b.msTimes.grow * b.threads.grow
                    + b.msTimes.weaken * b.threads.weaken
                )
            ) - (
                a.serverMaxMoney / (
                    a.msTimes.hack * a.threads.hack
                    + a.msTimes.grow * a.threads.grow
                    + a.msTimes.weaken * a.threads.weaken
                )
            )
    );
    ns.printf(
        '%30s:  %5s  (100%%)  Secur  |    Hack +   Grow +   Weak = Sum     threads |    Times    |   m/h   |   m/th',
        'Server',
        'money'
    );
    for (const goldMine of sortedGoldMines) {
        ns.printf(
            '%30s:  %5s  %6s  %3d S  |  %6d + %6d + %6d = %7d threads | %2sm %2sm %2sm | %7s | %7s',
            goldMine.server,
            ns.formatNumber(goldMine.serverMaxMoney, 0),
            '(' + ns.formatPercent(goldMine.serverMoney / goldMine.serverMaxMoney, 0) + ')',
            (goldMine.additionalSecurityLevel > 0.1 ? goldMine.additionalSecurityLevel : 0),
            goldMine.threads.hack,
            goldMine.threads.grow,
            goldMine.threads.weaken,
            goldMine.threads.grow + goldMine.threads.hack + goldMine.threads.weaken,
            goldMine.times.hack,
            goldMine.times.grow,
            goldMine.times.weaken,
            ns.formatNumber(
                goldMine.serverMaxMoney * 1800000
                / (goldMine.msTimes.hack + goldMine.msTimes.grow),
                1
            ),
            ns.formatNumber(
                goldMine.serverMaxMoney * 1800000 / (
                    goldMine.msTimes.hack * goldMine.threads.hack
                    + goldMine.msTimes.grow * goldMine.threads.grow
                    + goldMine.msTimes.weaken * goldMine.threads.weaken
                ),
                1
            ),
        );
    }
}

/** @param {NS} ns */
export async function main(ns: NS) {
    while (true) {
        await step(ns);
        await ns.sleep(1000);
    }
}