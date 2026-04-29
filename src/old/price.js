// Prints a table to the terminal, listing the costs of purchasing servers with different amounts of RAM.
// The following info is listed per row:
// - Amount of server RAM
// - Cost of a server with that amount of RAM
// - How many of those servers you could afford with your current money
// - How much it would cost to purchase all those servers
// - How much RAM each server would have relative to your 'home' RAM
/** @param {NS} ns */
export async function main(ns) {
	const maxRam = ns.getPurchasedServerMaxRam();
	// Fill array with all size choices for server RAM: 2^1 to 2^x, where x = Math.log2(ns.getPurchasedServerMaxRam())
	const ramSizes = Array.from(Array(Math.log2(maxRam)), (_, i) => Math.pow(2, i + 1));
	const money = ns.getServerMoneyAvailable("home");
	const serverLimit = ns.getPurchasedServerLimit();
	const currentServers = ns.getPurchasedServers().length;
	const buyableServers = serverLimit - currentServers;
	const ramLimit = +(ns.args[0] || 2) * 1024;
	let serverToUpgrade = null;
	let serverToUpgradeRam = maxRam - 1;
	let upgradeableServers = 0;
	if (buyableServers < 1) {
		for (const serverName of ns.getPurchasedServers()) {
				const serverRam = ns.getServerMaxRam(serverName);
				if (serverRam < maxRam) {
					upgradeableServers++;
				}
				if (serverRam < serverToUpgradeRam) {
					serverToUpgradeRam = serverRam;
					serverToUpgrade = serverName;
				}
		}
	}
	const maxBuy = upgradeableServers || buyableServers;
	// Print table header rows.
	ns.tprintf("%s", "\n");
	ns.tprintf("%s", "RAM size\tServer cost\t\tCan afford\tTotal cost");
	ns.tprintf("%s", "───────────────────────────────────────────────────────────────────────────────────────");
	// Perform calculations for each RAM size.
	for (let i = ramSizes.length - 1; i >= 0; i--) {
		if (upgradeableServers > 0 && serverToUpgradeRam >= ramSizes[i]) {
			break;
		}
		if (ramSizes[i] < ramLimit) {
			break;
		}
		let ramSize = ns.formatRam(ramSizes[i], 0);
		let serverCostFloat = serverToUpgrade ? ns.getPurchasedServerUpgradeCost(serverToUpgrade, ramSizes[i]) : ns.getPurchasedServerCost(ramSizes[i]);
		let canAffordInt = Math.floor(money / serverCostFloat);
		let totalCost = "$" + ns.formatNumber(Math.min(canAffordInt, maxBuy) * serverCostFloat);

		if (serverCostFloat <= 0) {
			break;
		}

		if (canAffordInt === 0) {
			totalCost = '-';
		}

		// Format serverCost, totalCost and canAfford after calculations have been completed.
		let serverCost = "$" + ns.formatNumber(serverCostFloat)
		if (serverCost.length < 8) {
			serverCost += "\t"; 
		}
		if (totalCost.length < 8) {
			totalCost += "\t";
		}
		let canAfford = "" + canAffordInt;
		if (canAffordInt > maxBuy) {
			canAfford = maxBuy + "+";
			i = 0;
		} else if (canAffordInt === 0) {
			canAfford = ns.formatPercent(money / serverCostFloat, 0);
		}
		// The '%' at the end is required to prevent tprintf() from interpreting the RAM percentage as a placeholder value.
		ns.tprintf("%s", ramSize + "\t\t" + serverCost + "\t\t" + canAfford + "\t\t" + totalCost);
	}
	// Print table footer row.
	ns.tprintf("%s", "───────────────────────────────────────────────────────────────────────────────────────");
}