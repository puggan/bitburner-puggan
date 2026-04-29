/** @param {NS} ns */
export async function augments(ns) {
	const donateRequirements = ns.getFavorToDonate();
	const player = ns.getPlayer();
	const factions = [];
	const augs = [];
	const currentAugsNames = ns.singularity.getOwnedAugmentations(true);
	for (const faction of player.factions) {
		const factionData = {
				name: faction,
				rep: ns.singularity.getFactionRep(faction) || -1,
				favor: ns.singularity.getFactionFavor(faction),
				donateable: null,
				needRep: 0,
			};
		factionData.donateable = factionData.favor > donateRequirements;
		for(const aug of ns.singularity.getAugmentationsFromFaction(faction)) {
			const augData =	{
				name: aug,
				faction,
				price: ns.singularity.getAugmentationBasePrice(aug),
				preReq: ns.singularity.getAugmentationPrereq(aug),
				rep: ns.singularity.getAugmentationRepReq(aug) || 0,
				stats: ns.singularity.getAugmentationStats(aug),
				owned: currentAugsNames.includes(aug),
				availible: null,
			}
			augData.availible = !augData.owned && augData.rep <= factionData.rep;
			if (augData.name === 'NeuroFlux Governor') {
				augData.availible = augData.rep <= factionData.rep;
			}
			augs.push(augData);
			if (!augData.owned && augData.rep > factionData.rep && factionData.needRep < augData.rep) {
				factionData.needRep = augData.rep;
			}
		}
		factions.push(
			factionData
		);
	}
	ns.printf("%d aug loaded", augs.length);
  const availibleAugs = augs.filter((a) => a.availible);
	ns.printf("%d aug availible", availibleAugs.length);
	availibleAugs.sort((a, b) => b.price - a.price);
	for(const augData of availibleAugs) {
		if (ns.singularity.purchaseAugmentation(augData.faction, augData.name)) {
			ns.printf('Purchases %s from %s', augData.name, augData.faction);
			ns.tprintf('Purchases %s from %s', augData.name, augData.faction);
			return true;
		}
	}
	ns.printf('Nothing purchaseable');
	return false;
}

/** @param {NS} ns */
export async function homeUpgrades(ns) {
	return ns.singularity.upgradeHomeRam() || ns.singularity.upgradeHomeCores();
}

export function accendGang(ns) {
  if (!ns.gang.inGang()) return;
	for (const name of ns.gang.getMemberNames()) {
		ns.gang.ascendMember(name);
	}
}

/** @param {NS} ns */
export async function main(ns) {
	while (await augments(ns)) {
		await ns.sleep(1000);
	};
	while (await homeUpgrades(ns)) {
		await ns.sleep(1000);
	};
	accendGang(ns);
	ns.singularity.installAugmentations('startup.js');
}