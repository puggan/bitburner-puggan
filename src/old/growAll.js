/** @param {NS} ns */
export async function main(ns) {
	for(;;) {
		/** @type {string} fileContent */
		const fileContent = ns.read("moneyServers.txt");
		let count = 0;
		for(const server of fileContent.split("\r\n")) {
			if (server.length < 1 || server.startsWith('#')) {
				continue;
			}
			count++;
			await ns.grow(server);
		}
		if (count < 1) {
			break;
		}
	}
}