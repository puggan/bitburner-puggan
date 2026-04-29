/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('getServerSecurityLevel');
	ns.disableLog('getServerMinSecurityLevel');
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('getServerMaxMoney');
	/** @type {string} fileContent */
	const fileContent = ns.read("moneyServers.txt");
	/** @type {{
	 *   server: string,
	 *   serverMoney: number,
	 *   serverMaxMoney: number,
	 * 	 additionalSecurityLevel: number,
	 *   threads: {
	 *     hack: number,
	 *     grow: number,
	 *     weaken: number,
	 *   }
	 * }[]} goldMines */
	const goldMines = [];
	for(const server of fileContent.split("\r\n")) {
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
		const msTimes = {
			'hack': ns.getHackTime(server),
			'grow': ns.getGrowTime(server),
			'weaken': ns.getWeakenTime(server),
		};
		msTimes.total = msTimes.hack + msTimes.grow + msTimes.weaken;
		const times = {
			'hack': Math.ceil(msTimes.hack/60000),
			'grow': Math.ceil(msTimes.grow/60000),
			'weaken': Math.ceil(msTimes.weaken/60000),
		};
		goldMines.push({server, serverMoney, serverMaxMoney, additionalSecurityLevel, threads, times, msTimes});
	}
	const sortedGoldMines = goldMines.sort((a,b) => b.serverMaxMoney - a.serverMaxMoney);
	ns.tprintf(
		'%30s:  %5s  (100%%)  Secur  |    Hack +   Grow +   Weak = Sum     threads |    Times    |   m/h   |   m/th',
		'Server',
		'money'
	);
	for(const goldMine of sortedGoldMines) {
		ns.tprintf(
			'%30s:  %5s  %6s  %3d S  |  %6d + %6d + %6d = %7d threads | %2sm %2sm %2sm | %7s | %7s',
			goldMine.server, 
			ns.nFormat(goldMine.serverMaxMoney, "0 a"),
			'(' + ns.nFormat(goldMine.serverMoney / goldMine.serverMaxMoney, "0%") + ')',
			(goldMine.additionalSecurityLevel > 0.1 ?  goldMine.additionalSecurityLevel : 0),
			goldMine.threads.hack,
			goldMine.threads.grow,
			goldMine.threads.weaken,
			goldMine.threads.grow + goldMine.threads.hack + goldMine.threads.weaken,
			goldMine.times.hack,
			goldMine.times.grow,
			goldMine.times.weaken,
			ns.nFormat(
				goldMine.serverMaxMoney * 1800000
				/ (goldMine.msTimes.hack + goldMine.msTimes.grow),
				'0.0 a'
			),
			ns.nFormat(
				goldMine.serverMaxMoney * 1800000 / (
					goldMine.msTimes.hack * goldMine.threads.hack
					+ goldMine.msTimes.grow * goldMine.threads.grow
					+ goldMine.msTimes.weaken * goldMine.threads.weaken
				),
				'0.0 a'
			),
		);
	}
}