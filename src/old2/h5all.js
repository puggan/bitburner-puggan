/** @param {NS} ns */
export async function main(ns) {
    const serversInUse = [];
		const manager = ns.args[0] || 'home';
    const myServers = ['home', ...ns.getPurchasedServers()];
    const moneyServers = ns.read("moneyServers.txt").split("\r\n");
//    const moneyServers = ns.args.length < 2 ? ns.read("moneyServers.txt").split("\r\n") : ns.args.slice(1);
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
				if (manager !== 'home') {
					ns.scp("h5.js", manager, 'home');
				}
        ns.exec("h5.js", manager, 1, serverName, maxThreads);
        ns.tprintf("run h5.js %s %s", serverName, maxThreads);
    }
}