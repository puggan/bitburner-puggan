/** @param {NS} ns */
export async function main(ns) {
	const pLvl = ns.getHackingLevel();
	const fileContent = ns.read("rootList.txt") + "\r\nhome";
	const serverNames = fileContent.split("\r\n");
	const servers = [];
	for(const serverName of serverNames) {
		if (!serverName.length) continue;
		const server = ns.getServer(serverName);
		if (!server.hasAdminRights) {
			continue;
		}
		if (server.requiredHackingSkill > pLvl) {
			continue;
		}
		const maxRam = ns.getServerMaxRam(serverName);
		const usedRam = ns.getServerUsedRam(serverName);
		const freeRam = maxRam - usedRam;
		servers.push({serverName, freeRam, usedRam, maxRam});
	}
	servers.sort((a, b) => a.freeRam - b.freeRam);
	for(const server of servers) {
		ns.tprintf(
			"%s / %s: %s @ %.1f%%", 
			ns.formatRam(server.freeRam),
			ns.formatRam(server.maxRam),
			server.serverName,
			100 * server.freeRam / server.maxRam
		);
	}
}