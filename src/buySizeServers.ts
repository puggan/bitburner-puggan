import {NS, AutocompleteData} from '@ns';

/**
 * @param {AutocompleteData} data - context about the game, useful when autocompleting
 * @param {string[]} args - current arguments, not including "run script.js"
 * @returns {string[]} - the array of possible autocomplete options
 */
export function autocomplete(data: AutocompleteData, args: string[]) {
	switch (args.length) {
		case 1:
			return ['1P', '512T', '256T', '128T', '64T', '32T', '16T', '8T', '4T', '2T'];
		default:
			return [];
	}
}

/**
 * @param {NS} ns
 **/
export async function main(ns: NS) {
	const spareMoney = (ns.args[1] || 1) * 1024 * 1024 * 1024;

	const ramLimit = ((size) => {
		switch ('' + size) {
			case '1P':
			case '1PB':
			case '1000':
			case '1024':
				return 1024 * 1204;
			case '512T':
			case '500T':
			case '512':
			case '500':
				return 512 * 1024;
			case '256T':
			case '256':
				return 256 * 1024;
			case '128T':
			case '128':
				return 128 * 1024;
			case '64T':
			case '64':
				return 64 * 1024;
			case '32T':
			case '32':
				return 32 * 1024;
			case '16T':
			case '16':
				return 16 * 1024;
			case '8T':
			case '8':
				return 8 * 1024;
			case '4T':
			case '4':
				return 4 * 1024;
			case '2T':
			case '2':
				return 2 * 1024;
			case '1T':
			case '1':
				return 1024;
			case '512G':
				return 512;
			case '256G':
				return 256;
			case '128G':
				return 128;
		}
	})(ns.args[0]);

	if (!ramLimit) {
		throw new Error('Unknown size: ' + size);
	}

	const upgradeServer = async (ramLimit) => {
		const maxRam = Math.min(ramLimit, ns.getPurchasedServerMaxRam());
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

		const cost = ns.getPurchasedServerUpgradeCost(worstServerHost, ramLimit);
		let money = ns.getServerMoneyAvailable("home") - spareMoney;
		if (money < cost) {
			ns.tprint('Low Money');
			ns.tprintf("%s + %s / %s", ns.formatNumber(spareMoney), ns.formatNumber(money), ns.formatNumber(cost))
			return false;
		}

		ns.upgradePurchasedServer(worstServerHost, ramLimit);
		ns.tprintf('Upgraded server %s -> %s', worstServerHost, ns.formatRam(ramLimit));
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

	let serverCount = currentServers.length;
	while(serverCount < maxServers) {
		if (await buyNewServer(ramLimit)) {
			serverCount++;
		} else {
			return;
		}
	}

	while (await upgradeServer(ramLimit)) {}
}