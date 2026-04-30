/** @param {NS} ns */
export async function main(ns) {
    const serversInUse = [];
    const myServers = ['home', ...ns.getPurchasedServers()];
    const moneyServers = ns.args.length < 1 ? ns.read("moneyServers.txt").split("\r\n") : [ns.args[0]];
    for (const server of myServers) {
        const processes = ns.ps(server);
        if (processes.length < 0) {
            continue;
        }
        for (const process of processes) {
            for (const argument of process.args) {
                if (moneyServers.includes(argument) && !serversInUse.includes(argument)) {
                    serversInUse.push(argument);
                }
            }
        }
    }
    const serversToHack = moneyServers.filter(serverName => !serversInUse.includes(serverName));
    let totalThreads = 0;
    let totalScripts = 0;
    for (const serverName of serversToHack) {
        const maxThreads = Math.ceil(2 * ns.growthAnalyze(serverName, 2));
        if (maxThreads > 0) {
            totalThreads += maxThreads;
            totalScripts++;
        }
        ns.tprint("run h5.js " + serverName + " " + maxThreads);
    }
    ns.tprintf(
        "Running %d scripts with a total of %d threads, using up %s ram",
        totalScripts,
        totalThreads,
        ns.formatRam((totalThreads * 1.75 + totalScripts * 7.5), 0)
    );
}