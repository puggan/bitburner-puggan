/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('getServerSecurityLevel');
	ns.disableLog('getServerMinSecurityLevel');
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('getServerMaxMoney');
	const goldMines = [];
	for(const server of [ns.getHostname()]) {
		if (server.length < 1 || server.startsWith('#')) {
			continue;
		}
		const serverMoney = ns.getServerMoneyAvailable(server);
		const serverMaxMoney = ns.getServerMaxMoney(server);
		if (serverMoney < 1) {
			if (serverMaxMoney > 0) {
				ns.tprint(server + ': broken (' + ns.nFormat(serverMaxMoney, "0 a") + ')');
			}
			continue;
		}
		const additionalSecurityLevel = ns.getServerSecurityLevel(server) - ns.getServerMinSecurityLevel(server);
		const profit = ns.hackAnalyze(server);
		const hackThreads = Math.floor(0.45 / profit);
		const growThreads = ns.growthAnalyze(server, 2);
		const increasedThreat = ns.hackAnalyzeSecurity(hackThreads, server) + ns.growthAnalyzeSecurity(growThreads, server, 1);
		const reducedSecurity = ns.weakenAnalyze(1);
		const threads = {
			'hack': hackThreads,
			'grow': growThreads,
			'weaken': Math.ceil(increasedThreat / reducedSecurity),
		};
		const times = {
			'hack': Math.ceil(ns.getHackTime(server)/60000),
			'grow': Math.ceil(ns.getGrowTime(server)/60000),
			'weaken': Math.ceil(ns.getWeakenTime(server)/60000),
		};
		goldMines.push({server, serverMoney, serverMaxMoney, additionalSecurityLevel, threads, times});
	}
	const sortedGoldMines = goldMines.sort((a,b) => b.serverMaxMoney - a.serverMaxMoney);
	ns.tprintf('%30s:  %5s  (100%%)  Secur  |  Hack + Grow + Weak = Sum   threads @ Sum     Ram | Time', 'Server', 'money');
	for(const goldMine of sortedGoldMines) {
		ns.tprintf(
			'%30s:  %5s  %6s  %3d S  |  %4d + %4d + %4d = %5d threads @ %7s Ram | %sm %sm %sm',
			goldMine.server, 
			ns.nFormat(goldMine.serverMaxMoney, "0 a"),
			'(' + ns.nFormat(goldMine.serverMoney / goldMine.serverMaxMoney, "0%") + ')',
			(goldMine.additionalSecurityLevel > 0.1 ?  goldMine.additionalSecurityLevel : 0),
			goldMine.threads.hack,
			goldMine.threads.grow,
			goldMine.threads.weaken,
			goldMine.threads.grow + goldMine.threads.hack + goldMine.threads.weaken,
			null,
			goldMine.times.hack,
			goldMine.times.grow,
			goldMine.times.weaken,
		);
	}
}