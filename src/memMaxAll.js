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
		servers.push({serverName, maxRam});
	}
	servers.sort((a, b) => a.maxRam - b.maxRam || a.serverName.localeCompare(b.serverName));
	for(const server of servers) {
		ns.tprintf(
			"%s: %s", 
			ns.formatRam(server.maxRam),
			server.serverName,
		);
	}
}