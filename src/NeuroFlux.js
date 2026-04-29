/** @param {NS} ns */
export async function main(ns) {
	const donateRequirements = ns.getFavorToDonate();
	const player = ns.getPlayer();
	const factions = [];
	const augs = [];
	const currentAugsNames = ns.singularity.getOwnedAugmentations(true);
	for(const faction of player.factions) {
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
			/*
			if (augData.name[0] === 'N') {
				ns.tprintf(
					"Debug %s from %s, owned: %d, rep cost: %d, current rep: %d, enough rep: %d\n",
					augData.name,
					augData.faction,
					augData.owned ? 1 : 0,
					augData.rep || -2,
					factionData.rep || -2,
					augData.rep <= factionData.rep ? 1 : 0
				);
			}
			*/
			augs.push(augData);
			if (!augData.owned && augData.rep > factionData.rep && factionData.needRep < augData.rep) {
				factionData.needRep = augData.rep;
			}
		}
		factions.push(
			factionData
		);
	}
	ns.tprintf("%d aug loaded", augs.length);
  const availibleAugs = augs.filter((a) => a.availible);
	ns.tprintf("%d aug availible", availibleAugs.length);
	availibleAugs.sort((a, b) => b.price - a.price);
	for(const augData of availibleAugs) {
		if (ns.singularity.purchaseAugmentation(augData.faction, augData.name)) {
			ns.tprintf('Purchases %s from %s', augData.name, augData.faction);
			return;
		}
	}
	ns.tprintf('Nothing purchaseable');
}