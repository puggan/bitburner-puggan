/**
 * Script for automate Bitburner Hacknet Nodes
 * @param {NS} ns
 * @source https://gist.github.com/grimley517/c2d531976db057cede4ac8e367418971
 * @author grimley517
 */
export async function main(ns) {
	const paybackLimit = 24 * 60 * 60;
	const sleepMilliseconds = 5 * 1000;
	const miniSleepMilliseconds = 100;
	const budgetPercentage = 0.95;
	const budgetOffset = 1e3;

	ns.disableLog('ALL');

 	while (true) {
		const budget = ns.getServerMoneyAvailable('home') * budgetPercentage - budgetOffset;
		const nodeNumber = ns.hacknet.numNodes();
		let actionList = [];
		if (nodeNumber > 0) {
			for (let i = 0; i < nodeNumber; i++) {
				const nodeActions = [
					new RamAction(ns, i),
					new CoreAction(ns, i),
					new LevelAction(ns, i)
				];
				nodeActions.forEach(action => actionList.push(action));
			}
			const firstNodeStats = ns.hacknet.getNodeStats(0);
			actionList.push(
				new NewNodeAction(
					ns,
					Math.floor(firstNodeStats.level),
					1 + Math.round(Math.log2(firstNodeStats.ram)),
					Math.floor(firstNodeStats.cores)
				)
			);
		}
		actionList.push(new NewNodeAction(ns, 1, 1, 1));
		actionList.push(new NewNodeAction(ns, 200, 6, 16));
		actionList = actionList.filter(
			action => action.prodIncrease > 0 &&
				action.cost > 0 &&
				action.payBackTime() < paybackLimit
		);
		if (actionList.length > 0) {
			actionList = actionList.filter(action => action.cost < budget);
			if (actionList.length > 0) {
				actionList.sort((x, y) => x.payBackTime() - y.payBackTime());
				actionList[0].doAction();
				await ns.sleep(miniSleepMilliseconds);
			} else {
				ns.print(`Not enough budget for next action.`);
				await ns.sleep(sleepMilliseconds);
			}
		}
		else {
			ns.tprint(`All Hacknet Nodes are fully productive.`);
			break;
		}
	}
}

class Action {
	constants = {
		MaxLevel: 200,
		MaxRam: 64,
		MaxCores: 16,
		MoneyGainPerLevel: 1.5,
		HackNetNodeMoneyBitNode: 1 //0.25
	}
	sys;
	nodeIndex;

	cost;
	originalProd;
	prodIncrease;
	name;
	multProd;
	ram;
	level;
	cores;
	ns;

	doAction = () => { return null; };

	constructor(ns, nodeIndex) {
		this.ns = ns;
		this.sys = ns.hacknet;
		this.nodeIndex = nodeIndex;
		this.multProd = ns.getHacknetMultipliers().production;
		const stats = (nodeIndex < 0) ? {name: '', ram: 1, level: 1, cores: 1} : this.sys.getNodeStats(nodeIndex);
		this.name = stats.name;
		this.ram = stats.ram;
		this.level = parseFloat(stats.level);
		this.cores = parseFloat(stats.cores);
		// this.originalProd = parseFloat(stats.production);
		this.originalProd = this.upgradedProdRate(ns);
	}
	payBackTime() {
		return this.cost / this.prodIncrease;
	}
	upgradedProdRate(ns) {
		return this.calculateMoneyGainRate(this.level, this.ram, this.cores, this.multProd);
	}

	calculateMoneyGainRate(level, ram, cores, mult) {
		const gainPerLevel = this.constants.MoneyGainPerLevel;
		const levelMult = level * gainPerLevel;
		const ramMult = Math.pow(1.035, ram - 1);
		const coresMult = (cores + 5) / 6.0;

		return levelMult * ramMult * coresMult * mult * this.constants.HackNetNodeMoneyBitNode;
	}
}

class RamAction extends Action {
	constructor(ns, nodeIndex) {
		super(ns, nodeIndex);
		this.cost = this.sys.getRamUpgradeCost(this.nodeIndex, 1);
		if (isFinite(this.cost) && this.cost > 0) {
			++this.ram;
			this.prodIncrease = this.upgradedProdRate(ns) - this.originalProd;
			this.doAction = () => {
				this.sys.upgradeRam(nodeIndex, 1);
				ns.print(`upgrading Ram on node ${this.nodeIndex}, payback time is ${Math.ceil(this.payBackTime() / 36) / 100} hours`);
			}
		}
		else {
			this.prodIncrease = 0;
		}
	}
}

class LevelAction extends Action {
	constructor(ns, nodeIndex) {
		super(ns, nodeIndex);
		this.cost = this.sys.getLevelUpgradeCost(this.nodeIndex, 1);
		if (isFinite(this.cost) && this.cost > 0) {
			++this.level;
			this.prodIncrease = this.upgradedProdRate(ns) - this.originalProd;
			this.doAction = () => {
				this.sys.upgradeLevel(nodeIndex, 1);
				ns.print(`upgrading Level on node ${this.nodeIndex}, payback time is ${Math.ceil(this.payBackTime() / 36) / 100} hours`);
			}
		}
		else {
			this.prodIncrease = 0;
		}
	}
}
class CoreAction extends Action {
	constructor(ns, nodeIndex) {
		super(ns, nodeIndex);
		this.cost = this.sys.getCoreUpgradeCost(this.nodeIndex, 1);
		if (isFinite(this.cost) && this.cost > 0) {
			++this.cores;
			this.prodIncrease = this.upgradedProdRate(ns) - this.originalProd;
			this.doAction = () => {
				this.sys.upgradeCore(nodeIndex, 1);
				ns.print(`upgrading Core on node ${this.nodeIndex}, payback time is ${Math.ceil(this.payBackTime() / 36) / 100} hours`);
			}
		}
		else {
			this.prodIncrease = 0;
		}
	}
}
class NewNodeAction extends Action {
	constructor(ns, level, ram, cores) {
		super(ns, -1);
		this.ram = 1;
		this.level = 1;
		this.cores = 1;
		this.originalProd = 0;
		this.cost = this.sys.getPurchaseNodeCost();
		this.fullCost = this.cost;
		const playerMultiplier = ns.getPlayer().hacknet_node_purchase_cost_mult;
		if (isFinite(this.cost) && this.cost > 0) {
			if (level > 1) {
				this.level = level;
				this.fullCost += this.calculateLevelUpgradeCost(1, level) * playerMultiplier;
			}
			if (ram > 1) {
				this.ram = ram;
				this.fullCost += this.calculateRamUpgradeCost(1, ram) * playerMultiplier;
			}
			if (cores > 1) {
				this.core = cores;
				this.fullCost += this.calculateCoreUpgradeCost(1, cores) * playerMultiplier;
			}
			this.prodIncrease = this.upgradedProdRate(ns) - this.originalProd;
			this.doAction = () => {
				this.sys.purchaseNode();
				ns.print(`Purchasing a new node. payback time is ${Math.ceil(this.payBackTime() / 36) / 100} hours`);
			}
		}
		else {
			this.prodIncrease = 0;
		}
	}

	payBackTime() {
		return this.fullCost / this.prodIncrease;
	}

	calculateLevelUpgradeCost(startingLevel, endLevel) {
		const mult = 1.04;
		let totalMultiplier = 0;
		for (let currLevel = startingLevel; currLevel <= endLevel; ++currLevel) {
			totalMultiplier += 1 * Math.pow(mult, currLevel);
		}

		return 500 * totalMultiplier;
	}

	calculateRamUpgradeCost(startingLevel, endLevel) {
		const sanitizedLevels = Math.round(endLevel - startingLevel);
		let totalCost = 0;
		let numUpgrades = startingLevel - 1;
		let currentRam = Math.pow(2, numUpgrades);

		for (let i = 0; i < sanitizedLevels; ++i) {
			const baseCost = currentRam * 30e3;
			const mult = Math.pow(1.28, numUpgrades);

			totalCost += baseCost * mult;

			currentRam *= 2;
			++numUpgrades;
		}

		return totalCost;
	}

	calculateCoreUpgradeCost(startingLevel, endLevel) {
		const sanitizedCores = Math.round(endLevel - startingLevel);
		const coreBaseCost = 500e3;
		const mult = 1.48;
		let totalCost = 0;
		let currentCores = startingLevel;
		for (let i = 0; i < sanitizedCores; ++i) {
			totalCost += coreBaseCost * Math.pow(mult, currentCores - 1);
			++currentCores;
		}

		return totalCost;
	}
}