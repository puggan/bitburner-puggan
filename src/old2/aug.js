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
				curPrice: ns.singularity.getAugmentationPrice(aug),
				preReq: ns.singularity.getAugmentationPrereq(aug),
				rep: ns.singularity.getAugmentationRepReq(aug) || 0,
				stats: ns.singularity.getAugmentationStats(aug),
				owned: currentAugsNames.includes(aug),
				availible: null,
			}
			augData.availible = !augData.owned && augData.rep <= factionData.rep;
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
	availibleAugs.sort((a, b) => a.price - b.price);
	let totalPrice = 0;
	let augIndex = 0;
	let lastAugName = '';
	let totalLimitNotPassed = true;
	let myMoney = ns.getServerMoneyAvailable('home');
	for(const augData of availibleAugs) {
		const duplicate = lastAugName == augData.name;
		lastAugName = augData.name;
		if (!duplicate) totalPrice = augData.curPrice + 2 * totalPrice;
		if (myMoney && myMoney < augData.curPrice) {
			ns.tprintf('%s', '-'.repeat(100));
			myMoney = null;
			totalLimitNotPassed = false;
		}
		if (myMoney && totalLimitNotPassed && myMoney < totalPrice) {
			ns.tprintf('%s', '-'.repeat(100));
			totalLimitNotPassed = false;
		}
		ns.tprintf(
			"%3d %74s %10s %10s\n",
			augIndex++,
			augData.faction + ': ' + augData.name,
			ns.formatNumber(augData.price),
			duplicate ? '-' : ns.formatNumber(totalPrice),
		);
	}
}