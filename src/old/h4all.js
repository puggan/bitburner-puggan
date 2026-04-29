/** @param {NS} ns */
export async function main(ns) {
	const self = ns.getHostname();
	const relay = ns.args.length < 1 ? self : ns.args[0]; 

    const serversInUse = [];
    const myServers = ['home', ...ns.getPurchasedServers()];
    const moneyServers = ns.read("moneyServers.txt").split("\r\n");
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
    for (const serverName of serversToHack) {
        const maxThreads = Math.ceil(2 * ns.growthAnalyze(serverName, 2));
        ns.exec("h4.js", "home", 1, serverName, relay, maxThreads);
    }
}