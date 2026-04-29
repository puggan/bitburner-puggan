/** @param {NS} ns */
export async function main(ns) {
	const script = 'h5rooted.js';
	const serversInUse = [];
	const manager = ns.args[0] || 'home';
	const rootedServers = ns.read("rootList.txt").split("\r\n");
	const myServers = ['home', ...ns.getPurchasedServers(), ...rootedServers];
	const moneyServers = ns.read("moneyServers.txt").split("\r\n");
	for (const server of myServers) {
		if (server !== 'home') {
		ns.scp(['rootList.txt', 'h5rooted.js', 'hackOnce.js', 'growOnce.js', 'weakenOnce.js'], server, 'home');
		}
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
				ns.scp(script, manager, 'home');
			}
			ns.exec(script, manager, 1, serverName, maxThreads);
			ns.tprintf("run %s %s %s", script, serverName, maxThreads);
	}
}