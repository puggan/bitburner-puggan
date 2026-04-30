/** @param {NS} ns */
export async function main(ns) {
	const script = "xpFarmHalf.js";
	const procent = ns.args[0] || 0.9;
	for(const serverName of ns.getPurchasedServers()) {
		for (const process of ns.ps(serverName)) {
			if (process.filename !== script) {
				continue;
			}
			ns.kill(process.pid);
		}
		ns.tprintf("installing on: %s", serverName);
		ns.scp(script, serverName);
		ns.exec(script, serverName, 1, procent)
	}
}
