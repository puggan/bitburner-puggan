/** @param {NS} ns */
export async function main(ns) {
	const script = "xpFarm.js";
	const fileContent = ns.read("serverList.txt");
	const serverNames = fileContent.split("\r\n");
	const servers = [];
	for(const serverName of serverNames) {
		if (!serverName.length) continue;
		const server = ns.getServer(serverName);
		if (server.purchasedByPlayer) {
			continue;
		}
		ns.kill(script, server.serverName);
		const maxRam = ns.getServerMaxRam(serverName);
		const usedRam = ns.getServerUsedRam(serverName);
		const freeRam = maxRam - usedRam;
		if (freeRam >= 8) {
			ns.tprintf("%i: %s", freeRam, serverName);
			ns.scp(script, serverName);
			ns.exec(script, serverName, 1)
		}
	}
}