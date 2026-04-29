/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('getServerSecurityLevel');
	ns.disableLog('getServerMinSecurityLevel');
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('getServerMaxMoney');
	for(;;) {
		/** @type {string} fileContent */
		const fileContent = ns.read("moneyServers.txt");
		for(const server of fileContent.split("\r\n")) {
			if (server.length < 1 || server.startsWith('#')) {
				continue;
			}
			const serverLevel = ns.getServerSecurityLevel(server);
			const serverMinLevel = ns.getServerMinSecurityLevel(server);
			const serverMoney = ns.getServerMoneyAvailable(server);
			const serverMaxMoney = ns.getServerMaxMoney(server);
			if (serverMoney < 1 || serverLevel > serverMinLevel + 5) {
				await ns.weaken(server);
			} else if (serverMoney < serverMaxMoney * 0.75) {
				await ns.grow(server);
			} else {
				await ns.hack(server);
			}
		}
	}
}