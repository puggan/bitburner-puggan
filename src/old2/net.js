/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		await upgrade(ns);
		await ns.sleep(1000);
	}
}

/** @param {NS} ns */
async function upgrade(ns) {
	const money = ns.getServerMoneyAvailable("home");
	const netServers = await ns.hacknet.numNodes();
	const maxNetServers = await ns.hacknet.maxNumNodes();

	if (maxNetServers < 1) {
		throw new Error('Net not availible');
	}

	if (!netServers) {
		await buyFirst(ns, money / 10);
		return;
	}

	if (netServers < maxNetServers && await buyNext(ns, 4 * 3600, 0.01, money)) {
		return;
	}

	const worstNet = await getWorstNet(ns, netServers);

	if (await buyAny(ns, netServers, worstNet, 0.001, money)) {
		return;
	}

	if (await buyPayOff(ns, netServers, 4 * 3600, worstNet, 0.1, money)) {
		return;
	}

	if (await buyPayOff(ns, netServers, 8 * 3600, worstNet, 0.01, money)) {
		return;
	}
}

/**
 * @param {NS} ns 
 * @param {number} budget money
 */
async function buyFirst(ns, budget) {
	const newNodeCost = ns.hacknet.getPurchaseNodeCost();
	if (newNodeCost > budget) {
		throw new Error('First Net failed, no money');
	}
	ns.hacknet.purchaseNode();
}

/**
 * @param {NS} ns 
 * @param {NodeStat} worstNet
 * @param {number} budget share
 * @param {number} money
 */
async function buyAny(ns, netServers, worstNet, budget, money) {
	let upgrades = false;
	for (let index = 0; index < netServers; index++) {
		const stat = ns.hacknet.getNodeStats(index);
		if (stat.level > worstNet.level) {
			continue;
		}
		const cost = ns.hacknet.getLevelUpgradeCost(index);
		if (cost > money * budget) {
			continue;
		}
		ns.hacknet.upgradeLevel(index);
		upgrades = true;
		money -= cost;
	}
	if (upgrades) return true;

	for (let index = 0; index < netServers; index++) {
		const stat = ns.hacknet.getNodeStats(index);
		if (stat.ram > worstNet.ram) {
			continue;
		}
		const cost = ns.hacknet.getRamUpgradeCost(index);
		if (cost > money * budget) {
			continue;
		}
		ns.hacknet.upgradeRam(index);
		upgrades = true;
		money -= cost;
	}
	if (upgrades) return true;

	for (let index = 0; index < netServers; index++) {
		const stat = ns.hacknet.getNodeStats(index);
		if (stat.cores > worstNet.cores) {
			continue;
		}
		const cost = ns.hacknet.getCoreUpgradeCost(index);
		if (cost > money * budget) {
			continue;
		}
		ns.hacknet.upgradeCore(index);
		upgrades = true;
		money -= cost;
	}
	if (upgrades) return true;

	return false;
}

/**
 * @param {NS} ns 
 * @param {number} netServers
 * @param {number} maxPayOff secounds
 * @param {NodeStat} worstNet
 * @param {number} budget share
 * @param {number} money
 */
async function buyPayOff(ns, netServers, maxPayOff, worstNet, budget, money) {
	let upgrades = false;
	for (let index = 0; index < netServers; index++) {
		const stat = ns.hacknet.getNodeStats(index);
		if (stat.level > worstNet.level) {
			continue;
		}
		const cost = ns.hacknet.getLevelUpgradeCost(index);
		if (cost > money * budget) {
			continue;
		}
		const productionInc = stat.production * ((stat.level + 1) / stat.level - 1); 
		if (productionInc * maxPayOff < cost) {
			continue;
		}
		ns.hacknet.upgradeLevel(index);
		upgrades = true;
		money -= cost;
	}
	if (upgrades) return true;

	for (let index = 0; index < netServers; index++) {
		const stat = ns.hacknet.getNodeStats(index);
		if (stat.ram > worstNet.ram) {
			continue;
		}
		const cost = ns.hacknet.getRamUpgradeCost(index);
		if (cost > money * budget) {
			continue;
		}
		const productionInc = stat.production * 0.07;
		if (productionInc * maxPayOff < cost) {
			continue;
		}
		ns.hacknet.upgradeRam(index);
		upgrades = true;
		money -= cost;
	}
	if (upgrades) return true;

	for (let index = 0; index < netServers; index++) {
		const stat = ns.hacknet.getNodeStats(index);
		if (stat.cores > worstNet.cores) {
			continue;
		}
		const cost = ns.hacknet.getCoreUpgradeCost(index);
		if (cost > money * budget) {
			continue;
		}
		const productionInc = stat.production * ((stat.cores + 5) / (stat.cores + 4) - 1)
		if (productionInc * maxPayOff < cost) {
			continue;
		}
		ns.hacknet.upgradeCore(index);
		upgrades = true;
		money -= cost;
	}
	if (upgrades) return true;

	return false;
}

/**
 * @param {NS} ns 
 * @param {number} maxPayOff secounds
 * @param {number} budget share
 * @param {number} money
 */
async function buyNext(ns, maxPayOff, budget, money) {
	let newNodeCost = ns.hacknet.getPurchaseNodeCost();
	if (newNodeCost > money * budget) {
		return false;
	}

	const firstNodeStats = ns.hacknet.getNodeStats(0);
	if (firstNodeStats.production * maxPayOff < newNodeCost) {
		return false;
	}

	ns.hacknet.purchaseNode();
	return true;
}

/** @param {NS} ns */
async function getWorstNet(ns, netServers) {
	let worstNet = ns.hacknet.getNodeStats(0);
	for (let index = 1; index < netServers; index++) {
		const stat = ns.hacknet.getNodeStats(index);
		if (stat.cache > worstNet.cache) continue;
		if (stat.cache < worstNet.cache) worstNet = stat;
		if (stat.ram > worstNet.ram) continue;
		if (stat.ram < worstNet.ram) worstNet = stat;
		if (stat.cores > worstNet.cores) continue;
		if (stat.cores < worstNet.cores) worstNet = stat;
	}
	return worstNet;
}
