/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('ALL');
	const fileContent = ns.read("serverList.txt");
	const servers = [];
	for(const server of fileContent.split("\r\n")) {
		const nsServer = ns.getServer(server);
		const time = ns.getWeakenTime(server);
		const rawXp = 3 + nsServer.baseDifficulty * 3;

		servers.push(
			{
				name: server,
				time,
				xp: rawXp,
				xph: 36e5 * rawXp / time
			}
		);
	}
	servers.sort((a,b) => a.xph - b.xph);
	ns.tprintf('%30s %10s %10s %10s', 'name', 'time', 'xp', 'xph');
	for(const server of servers) {
		ns.tprintf('%30s %10d %10d %10d', server.name, server.time, server.xp, server.xph);
	}
}