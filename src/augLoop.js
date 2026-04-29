/** @param {NS} ns */
export async function step(ns) {
	const donateRequirements = ns.getFavorToDonate();
	const player = ns.getPlayer();
	const factionsMap = {};
	const augs = [];
	const currentAugsNames = ns.singularity.getOwnedAugmentations(true);
	const intrestingFactions = new Set(
		[
			// Early Game / City
			/*"CSEC",*/ "CyberSec", "Tian Di Hui", "Netburners", "Sector-12", "Chongqing", 
			"New Tokyo", "Ishima", "Aevum", "Volhaven",
			// Hacking Groups
			"NiteSec", "The Black Hand", "BitRunners",
			// Megacorps
			"ECorp", "MegaCorp", "KuaiGong International", "Four Sigma", "NWO", 
			"Blade Industries", "OmniTek Incorporated", "Bachman & Associates", 
			"Clarke Incorporated", "Fulcrum Secret Technologies",
			// Criminal / Endgame
			"Slum Snakes", "Tetrads", "Silhouette", "Speakers for the Dead", 
			"The Dark Army", "The Syndicate", "The Covenant", "Daedalus", "Illuminati"
		]
	);
	const playerFactions = new Set(player.factions);
	const combinedFactions = new Set([...player.factions, ...intrestingFactions]);

	for(const faction of combinedFactions) {
		const factionData = {
				name: faction,
				rep: ns.singularity.getFactionRep(faction) || -1,
				favor: ns.singularity.getFactionFavor(faction),
				donateable: null,
				needRep: 0,
				joined: playerFactions.has(faction),
			};
		factionData.donateable = factionData.favor > donateRequirements;
		for(const aug of ns.singularity.getAugmentationsFromFaction(faction)) {
			const augData =	{
				name: aug,
				faction,
				price: ns.singularity.getAugmentationBasePrice(aug),
				curPrice: ns.singularity.getAugmentationPrice(aug),
				preReq: ns.singularity.getAugmentationPrereq(aug),
				rep: ns.singularity.getAugmentationRepReq(aug) || 0,
				stats: ns.singularity.getAugmentationStats(aug),
				owned: currentAugsNames.includes(aug),
				availible: null,
			}
			augData.availible = factionData.joined && !augData.owned && augData.rep <= factionData.rep;
			augs.push(augData);
			if (!augData.owned && augData.rep > factionData.rep && factionData.needRep < augData.rep) {
				factionData.needRep = augData.rep;
			}
		}
		factionsMap[faction] = factionData;
	}
	ns.printf("%d aug loaded", augs.length);
  const availibleAugs = augs.filter((a) => a.availible);
	const availibleAugNames = new Set(availibleAugs.map(a => a.name));
	const augByName = {};
	for (const augData of augs) {
		if (!augByName[augData.name]) {
			augByName[augData.name] = {
				availible: availibleAugNames.has(augData.name),
				augData,
				factions: new Set(),
				owned: augData.owned,
				joined: null,
			};
		}
		augByName[augData.name].factions.add(augData.faction);
	}
	for(const augName of Object.keys(augByName)) {
		augByName[augName].joined = [...augByName[augName].factions].some(faction => factionsMap[faction].joined);
	}

	ns.printf("%d aug availible", availibleAugs.length);
	availibleAugs.sort((a, b) => a.price - b.price);
	let totalPrice = 0;
	let augIndex = 0;
	let lastAugName = '';
	let totalLimitNotPassed = true;
	let myMoney = ns.getServerMoneyAvailable('home');
	for (const augData of availibleAugs) {
		const duplicate = lastAugName == augData.name;
		lastAugName = augData.name;
		if (!duplicate) totalPrice = augData.curPrice + 2 * totalPrice;
		if (myMoney && myMoney < augData.curPrice) {
			ns.printf('%s', '-'.repeat(100));
			myMoney = null;
			totalLimitNotPassed = false;
		}
		if (myMoney && totalLimitNotPassed && myMoney < totalPrice) {
			ns.printf('%s', '-'.repeat(100));
			totalLimitNotPassed = false;
		}
		if (duplicate) {
			ns.printf(
				"    %74s %10s\n",
				augData.faction + ': ' + augData.name,
				ns.formatNumber(augData.price),
			);
		} else {
			ns.printf(
				"%3d %74s %10s %10s %s\n",
				augIndex++,
				augData.faction + ': ' + augData.name,
				ns.formatNumber(augData.price),
				ns.formatNumber(totalPrice),
				augByName[augData.name].factions.has("Slum Snakes") ? "🔪" : "💰",
			);
		}
	}
	ns.printf('%s', '-'.repeat(100));
	const lockedAugs = Object.values(augByName).filter(a => !a.owned && !a.availible)
	lockedAugs.sort((a, b) => a.augData.price - b.augData.price);
	for (const augDataSet of lockedAugs) {
		if (augDataSet.owned) continue;
		if (augDataSet.availible) continue;
		ns.printf(
			"%10s 🔒 %s %s @ %s",
			ns.formatNumber(augDataSet.augData.price),
			augDataSet.augData.name,
			augDataSet.factions.has("Slum Snakes") ? 
				"🔪" : 
				(
					augDataSet.joined ?
					"💰" :
					"🔒"
				),
			[...augDataSet.factions].join(', '),
		);
	}
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('sleep');
	while (true) {
		ns.clearLog();
		await step(ns);
		await ns.sleep(5000);
	}
}
