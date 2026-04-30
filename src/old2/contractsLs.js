/** @param {NS} ns */
export async function main(ns) {
	const fileContent = ns.read("serverList.txt");
	const serverNames = fileContent.split("\r\n");
	for(const serverName of serverNames) {
		for (const contractName of ns.ls(serverName, ".cct")) {
			ns.tprintf("Contract %s @ %s", contractName, serverName);
		}
	}
}