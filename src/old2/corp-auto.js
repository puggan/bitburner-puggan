export function formatMoney(ns, n) {
	return isNaN(n) ? 'NaN' : ns.nFormat(n, '$0.000a');
}

export function getCities() {
	return ['Sector-12', 'Aevum', 'Chongqing', 'New Tokyo', 'Ishima', 'Volhaven'];
};

export function getJobs() {
	return {
		operations: 'Operations',
		engineer: 'Engineer',
		business: 'Business',
		management: 'Management',
		RAndD: 'Research & Development'
	};
}

export function getResearch() {
	return {
		lab: 'Hi-Tech R&D Laboratory',
		market1: 'Market-TA.I',
		market2: 'Market-TA.II',
		fulcrum: 'uPgrade: Fulcrum',
		capacity1: 'uPgrade: Capacity.I',
		capacity2: 'uPgrade: Capacity.II'
	};
}

export function getUpgrades() {
	return [
		'Smart Factories',
		'Smart Storage',
		'DreamSense',
		'Wilson Analytics',
		'Nuoptimal Nootropic Injector Implants',
		'Speech Processor Implants',
		'Neural Accelerators',
		'FocusWires',
		'ABC SalesBots',
		'Project Insight'
	];
}

/** @param {NS} ns */
export async function main(ns) {
	await autopilot(ns, getJobs(), 'SunSmoke', 'Aevum');
}

export async function autopilot(ns, jobs, division, mainCity) {
	const upgrades = getResearch();
	const minResearch = 50e3;
	let maxProducts = 3;
	if (ns.corporation.hasResearched(division, upgrades.capacity1)) maxProducts++;
	if (ns.corporation.hasResearched(division, upgrades.capacity2)) maxProducts++;
	// Get latest version
	let version = getLatestVersion(ns, division);

	// noinspection InfiniteLoopJS
	while (true) {
		const lastProductName = 'T' + version;
  	if (ns.corporation.getProduct(division, mainCity, lastProductName).developmentProgress >= 100) {
			// Start selling the developed version
			ns.corporation.sellProduct(division, mainCity, lastProductName, 'MAX', 'MP*' + (2 ** (version - 1)), true);
			// Set Market TA II if researched
			if (ns.corporation.hasResearched(division, upgrades.market2)) ns.corporation.setProductMarketTA2(division, lastProductName, true);
			// Discontinue earliest version
			if (ns.corporation.getDivision(division).products.length === maxProducts) ns.corporation.discontinueProduct(division, 'T' + getEarliestVersion(ns, division));
			// Start making new version
			await makeProduct(ns, division, mainCity, 'T' + (version + 1), 1e9 * 2 ** version, 1e9 * 2 ** version);
			// Update current version
			version++;
		}
		// Use hashes to boost research
		if (ns.hacknet.numHashes() >= ns.hacknet.hashCost('Exchange for Corporation Research') &&
			ns.corporation.getDivision(division).research < 3 * minResearch) ns.hacknet.spendHashes('Exchange for Corporation Research');
		// Check research progress for lab
		if (!ns.corporation.hasResearched(division, upgrades.lab) &&
			ns.corporation.getDivision(division).research - ns.corporation.getResearchCost(division, upgrades.lab) >= minResearch) {
			ns.corporation.research(division, upgrades.lab);
		}
		// Check research progress for Market TAs
		let researchCost = 0;
		if (!ns.corporation.hasResearched(division, upgrades.market1)) researchCost += ns.corporation.getResearchCost(division, upgrades.market1);
		if (!ns.corporation.hasResearched(division, upgrades.market2)) researchCost += ns.corporation.getResearchCost(division, upgrades.market2);
		if (ns.corporation.hasResearched(division, upgrades.lab) && researchCost > 0 &&
			ns.corporation.getDivision(division).research - researchCost >= minResearch) {
			if (!ns.corporation.hasResearched(division, upgrades.market1)) ns.corporation.research(division, upgrades.market1);
			if (!ns.corporation.hasResearched(division, upgrades.market2)) {
				ns.corporation.research(division, upgrades.market2);
				// Set Market TA II on for the current selling versions
				for (const product of ns.corporation.getDivision(division).products) ns.corporation.setProductMarketTA2(division, product, true);
			}
		}
		// Check research progress for Fulcrum
		if (ns.corporation.hasResearched(division, upgrades.market2) && !ns.corporation.hasResearched(division, upgrades.fulcrum) &&
			ns.corporation.getDivision(division).research - ns.corporation.getResearchCost(division, upgrades.fulcrum) >= minResearch) {
			ns.corporation.research(division, upgrades.fulcrum);
		}
		// Check research progress for Capacity I
		if (ns.corporation.hasResearched(division, upgrades.fulcrum) && !ns.corporation.hasResearched(division, upgrades.capacity1) &&
			ns.corporation.getDivision(division).research - ns.corporation.getResearchCost(division, upgrades.capacity1) >= minResearch) {
			ns.corporation.research(division, upgrades.capacity1);
			maxProducts++;
		}
		// Check research progress for Capacity II
		if (ns.corporation.hasResearched(division, upgrades.capacity1) && !ns.corporation.hasResearched(division, upgrades.capacity2) &&
			ns.corporation.getDivision(division).research - ns.corporation.getResearchCost(division, upgrades.capacity2) >= minResearch) {
			ns.corporation.research(division, upgrades.capacity2);
			maxProducts++;
		}
		// Check what is cheaper
		if (ns.corporation.getOfficeSizeUpgradeCost(division, mainCity, 15) < ns.corporation.getHireAdVertCost(division)) {
			// Upgrade office size in Aevum
			if (ns.corporation.getCorporation().funds >= ns.corporation.getOfficeSizeUpgradeCost(division, mainCity, 15)) {
				ns.corporation.upgradeOfficeSize(division, mainCity, 15);
				hireMaxEmployees(ns, division, mainCity);
				// Assign jobs
				const dist = Math.floor(ns.corporation.getOffice(division, mainCity).size / Object.keys(jobs).length);
				for (let job of Object.values(jobs)) {
					await ns.corporation.setAutoJobAssignment(division, mainCity, job, dist);
				}
			}
		}
		// Hire advert
		else if (ns.corporation.getCorporation().funds >= ns.corporation.getHireAdVertCost(division)) ns.corporation.hireAdVert(division);
		// Level upgrades
		levelUpgrades(ns, 0.1);
		// Go public
		if (ns.corporation.getCorporation().revenue >= 1e18) ns.corporation.goPublic(0);
		// If public
		if (ns.corporation.getCorporation().public) {
			// Sell a small amount of shares when they amount to more cash than we have on hand
			if (ns.corporation.getCorporation().shareSaleCooldown <= 0 && ns.corporation.getCorporation().sharePrice * 1e6 > ns.getPlayer().money) {
				// ns.corporation.sellShares(1e6);
			}
			// Buyback shares when we can
			else if (ns.corporation.getCorporation().issuedShares > 0 &&
				ns.getPlayer().money > 2 * ns.corporation.getCorporation().issuedShares * ns.corporation.getCorporation().sharePrice)
				ns.corporation.buyBackShares(ns.corporation.getCorporation().issuedShares);
			// Check if we can unlock Shady Accounting
			if (ns.corporation.getCorporation().funds >= ns.corporation.getUnlockCost('Shady Accounting') &&
				!ns.corporation.hasUnlockUpgrade('Shady Accounting')) ns.corporation.unlockUpgrade('Shady Accounting');
			// Check if we can unlock Government Partnership
			if (ns.corporation.getCorporation().funds >= ns.corporation.getUnlockCost('Government Partnership') &&
				!ns.corporation.hasUnlockUpgrade('Government Partnership')) ns.corporation.unlockUpgrade('Government Partnership');
			// Issue dividends
			ns.corporation.issueDividends(dividendsPercentage(ns));
		}
		// Update every second
		await ns.sleep(1000);
	}
}

export async function makeProduct(ns, division, city, name, design = 0, marketing = 0) {
	const products = ns.corporation.getDivision(division).products;
	const proposedVersion = parseVersion(name);
	let currentBestVersion = 0;
	for (let product of products) {
		let version = parseVersion(product);
		if (version > currentBestVersion) currentBestVersion = version;
	}
	if (proposedVersion > currentBestVersion) {
		await moneyForAmount(ns, design + marketing);
		ns.corporation.makeProduct(division, city, name, design, marketing);
		ns.print(`Started to make ${name} in ${division} (${city}) with ${formatMoney(ns, design)} for design and ${formatMoney(ns, marketing)} for marketing`);
	} else ns.print(`Already making/made ${name} in ${division} (${city})`);
}

export function getLatestVersion(ns, division) {
	const products = ns.corporation.getDivision(division).products;
	let latestVersion = 0;
	for (let product of products) {
		let version = parseVersion(product);
		ns.tprint('Product parsed: ', product, ' -> ', version);
		if (version > latestVersion) latestVersion = version;
	}
	return latestVersion;
}

export function getEarliestVersion(ns, division) {
	const products = ns.corporation.getDivision(division).products;
	let earliestVersion = Number.MAX_SAFE_INTEGER;
	for (let product of products) {
		let version = parseVersion(product);
		if (version < earliestVersion) earliestVersion = version;
	}
	return earliestVersion;
}

export function parseVersion(name) {
	return parseInt(name.substr(1));
}

export function hireMaxEmployees(ns, division, city) {
	ns.print(`Hiring employees for ${division} (${city})`);
	while (ns.corporation.getOffice(division, city).employees.length < ns.corporation.getOffice(division, city).size) {
		ns.corporation.hireEmployee(division, city);
	}
}

async function moneyForAmount(ns, amount) {
	while (amount > ns.corporation.getCorporation().funds) {
		await ns.sleep(1000);
	}
}

export function dividendsPercentage(ns) {
	return Math.max(0, Math.min(0.99, Math.log(ns.corporation.getCorporation().revenue) / (20 * Math.log(1000))));
}

export function levelUpgrades(ns, percent) {
	let cheapestCost = Infinity;
	let cheapestUpgrade;
	for (const upgrade of getUpgrades()) {
		const cost = ns.corporation.getUpgradeLevelCost(upgrade);
		if (cost < cheapestCost) {
			cheapestUpgrade = upgrade;
			cheapestCost = cost;
		}
	}
	if (percent * ns.corporation.getCorporation().funds >= cheapestCost) ns.corporation.levelUpgrade(cheapestUpgrade);
}
