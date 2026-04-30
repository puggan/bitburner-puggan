/**
 * @param {AutocompleteData} data - context about the game, useful when autocompleting
 * @param {string[]} args - current arguments, not including "run script.js"
 * @returns {string[]} - the array of possible autocomplete options
 */
export function autocomplete(data, args) {
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
export async function main(ns) {
	const ram = ((size) => {
		switch ('' + size) {
			case '1P':
			case '1PB':
			case '1000':
			case '1024':
				return 1024 * 1204;
			case '512T':
			case '512TB':
			case '500T':
			case '500TB':
			case '512':
			case '500':
				return 512 * 1024;
			case '256T':
			case '256TB':
			case '256':
				return 256 * 1024;
			case '128T':
			case '128TB':
			case '128':
				return 128 * 1024;
			case '64T':
			case '64TB':
			case '64':
				return 64 * 1024;
			case '32T':
			case '32TB':
			case '32':
				return 32 * 1024;
			case '16T':
			case '16TB':
			case '16':
				return 16 * 1024;
			case '8T':
			case '8TB':
			case '8':
				return 8 * 1024;
			case '4T':
			case '4TB':
			case '4':
				return 4 * 1024;
			case '2T':
			case '2TB':
			case '2':
				return 2 * 1024;
			case '1T':
			case '1TB':
			case '1':
				return 1024;
			case '512G':
			case '512GB':
				return 512;
			case '256G':
			case '256GB':
				return 256;
			case '128G':
			case '128GB':
				return 128;
		}
	})(ns.args[0]);

	if (!ram) {
		throw new Error('Unknown size: ' + ns.args[0]);
	}

	const upgradeServer = async (ram) => {
		let worstServerHost = null;
		let worstServerRam = ram;
		for (const serverName of ns.getPurchasedServers()) {
			const serverRam = ns.getServerMaxRam(serverName);
			if (serverRam >= worstServerRam) {
				continue;
			}
			worstServerRam = serverRam;
			worstServerHost = serverName;
		}
		if (worstServerRam >= ram) {
			ns.tprint('Not an upgrade');
			return;
		}

		ns.tprintf('Server selected for upgrade %s with %d', worstServerHost, worstServerRam);

		const cost = ns.getPurchasedServerUpgradeCost(worstServerHost, ram);
		let money = ns.getServerMoneyAvailable("home");
		if (money < cost) {
			ns.tprint('Low Money');
			ns.tprint(cost)
			ns.tprint(ns.formatNumber(cost))
			return;
		}

		ns.upgradePurchasedServer(worstServerHost, ram);

		const serverPrefix = 'myS';
		if (worstServerHost.startsWith(serverPrefix.length)) {
			ns.tprintf('Upgraded server %s (%d)', worstServerHost, ram);
		} else {
			const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXYZ';
			let suffixIndex = 0;
			while (currentServers.indexOf(serverPrefix + alpha.charAt(suffixIndex)) >= 0 || ns.serverExists(serverPrefix + alpha.charAt(suffixIndex))) {
				suffixIndex++;
				await ns.sleep(100);
			}
			const serverName = serverPrefix + alpha.charAt(suffixIndex);
			ns.renamePurchasedServer(worstServerHost, serverName);
			ns.tprintf('Upgraded server %s -> %s (%d)', worstServerHost, serverName, ram);
		}
		await ns.sleep(100);
	};

	const buyNewServer = async (ram) => {
		const cost = ns.getPurchasedServerCost(ram);
		let money = ns.getServerMoneyAvailable("home");
		if (money < cost) {
			ns.tprint('Low Money');
			ns.tprint(cost)
			ns.tprint(ns.formatNumber(cost))
			return;
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
	};

	const maxServers = ns.getPurchasedServerLimit();
	const currentServers = ns.getPurchasedServers();

	let serverCount = currentServers.length;
	if (serverCount >= maxServers) {
		// TODO upgrade
		ns.tprint('Max servers');
		await upgradeServer(ram);
	} else {
		ns.tprintf('%d / %d servers', serverCount, maxServers);
		await buyNewServer(ram);
		ns.tprintf('%d / %d servers', serverCount + 1, maxServers);
	}
}