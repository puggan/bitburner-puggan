/**
 * @param {NS} ns
 **/
export async function main(ns) {
	const spareMoney = (ns.args[0] || 1) * 1024 * 1024 * 1024;

	const upgradeServer = async () => {
		const maxRam = ns.getPurchasedServerMaxRam();
		let worstServerHost = null;
		let worstServerRam = maxRam - 1;
		for (const serverName of ns.getPurchasedServers()) {
			const serverRam = ns.getServerMaxRam(serverName);
			if (serverRam >= worstServerRam) {
				continue;
			}
			worstServerRam = serverRam;
			worstServerHost = serverName
		}
		if (!worstServerHost) {
			ns.tprint('Nothing to upgrade');
			return false;
		}

		ns.tprintf('Server selected for upgrade %s with %s (of %s)', worstServerHost, ns.formatRam(worstServerRam), ns.formatRam(maxRam));

		const cost = ns.getPurchasedServerUpgradeCost(worstServerHost, worstServerRam * 2);
		let money = ns.getServerMoneyAvailable("home") - spareMoney;
		if (money < cost) {
			ns.tprint('Low Money');
			ns.tprintf("%s + %s / %s", ns.formatNumber(spareMoney), ns.formatNumber(money), ns.formatNumber(cost))
			return false;
		}

		ns.upgradePurchasedServer(worstServerHost, worstServerRam * 2);
		ns.tprintf('Upgraded server %s -> %s', worstServerHost, ns.formatRam(worstServerRam * 2));
		await ns.sleep(100);
		return true;
	};

	const buyNewServer = async (ram) => {
		const cost = ns.getPurchasedServerCost(ram);
		let money = ns.getServerMoneyAvailable("home") - spareMoney;
		if (money < cost) {
			ns.tprint('Low Money');
			ns.tprintf("%s + %s / %s", ns.formatNumber(spareMoney), ns.formatNumber(money), ns.formatNumber(cost))
			return false;
		}

		const serverPrefix = 'myS';
		const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXYZ';
		let suffixIndex = 0;
		while (currentServers.indexOf(serverPrefix + alpha.charAt(suffixIndex)) >= 0 || ns.serverExists(serverPrefix + alpha.charAt(suffixIndex))) {
			suffixIndex++;
			await ns.sleep(100);
		}
		const serverName = serverPrefix + alpha.charAt(suffixIndex);
		ns.purchaseServer(serverName, ram)
		ns.tprint('New server: ' + serverName);
		await ns.sleep(100);
		return true;
	};

	const maxServers = ns.getPurchasedServerLimit();
	const currentServers = ns.getPurchasedServers();

  const homeRam = ns.getServerMaxRam('home');
  const maxRam = ns.getPurchasedServerMaxRam();
	let serverCount = currentServers.length;
	while(serverCount < maxServers) {
		if (await buyNewServer(Math.min(homeRam / 2, maxRam / 4))) {
			serverCount++;
		} else {
			return;
		}
	}

	while (await upgradeServer()) {}
}