/** @param {NS} ns */
export async function main(ns) {
	/** @type {string} fileContent */
	const fileContent = ns.read("serverList.txt");
	for (const server of fileContent.split("\r\n")) {
		if (server.length < 1 || server.startsWith('#')) {
			continue;
		}
		const serverMoney = ns.getServerMoneyAvailable(server);
		const serverMaxMoney = ns.getServerMaxMoney(server);
		if (serverMoney < 1 || serverMaxMoney < 1) {
			continue;
		} 
		ns.tprint(server + ' ' + serverMoney + ' / ' + serverMaxMoney + ' (' + (100 * serverMoney / serverMaxMoney) + ')');
	}
}