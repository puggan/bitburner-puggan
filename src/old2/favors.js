/** @param {NS} ns */
export async function main(ns) {
	ns.tprintf('%s', '-------------------------------------------------------------------------------');
	const playerInfo = ns.getPlayer();
	const currentAugsNames = ns.singularity.getOwnedAugmentations(true);
	const favorGoal = ns.getFavorToDonate();
	const factionList = [];
	
	for (const factionName of playerInfo.factions) {
		const currentFavor = ns.singularity.getFactionFavor(factionName);
		const gainedFavor = ns.singularity.getFactionFavorGain(factionName);
		let factionFavorGoal = favorGoal;
		if (['Slum Snakes'].includes(factionName)) {
			factionFavorGoal = 0;
			ns.tprint('Gang found');
		} else ns.tprint('other: ' + factionName);
		const missingFavor = factionFavorGoal ? factionFavorGoal - currentFavor - gainedFavor : 0;
		const missingFavorRep = missingFavor > 0 ? Math.ceil(25500 * 1.02 ** (missingFavor - 1) - 25000) : 0;

		let augMaxRep = 0;
		let augCount = 0;
		for (const aug of ns.singularity.getAugmentationsFromFaction(factionName)) {
			if (currentAugsNames.includes(aug)) {
				continue;
			}
			augCount++;
			const augRep = ns.singularity.getAugmentationRepReq(aug) || 0;
			if (augRep > augMaxRep) {
				augMaxRep = augRep;
			}
		}

		const missingRep = missingFavor > 0 ? Math.min(augMaxRep, missingFavorRep) : augMaxRep;

		factionList.push({factionName, currentFavor, gainedFavor, missingFavor, missingRep, augCount, augMaxRep, missingFavorRep});
	}

	factionList.sort(
		(a, b) => 
			((b.augMaxRep > 0) - (a.augMaxRep > 0)) ||
			((b.augMaxRep > b.missingFavorRep) - (a.augMaxRep > a.missingFavorRep)) ||
			(b.currentFavor + b.gainedFavor) - (a.currentFavor + a.gainedFavor)
	);

	for (const factionData of factionList) {
		if (!factionData.augMaxRep) {
			ns.tprintf(
				"%4d + %4d = %4d favor, no augmentations left, for %s",
				factionData.currentFavor,
				factionData.gainedFavor,
				factionData.currentFavor + factionData.gainedFavor,
				factionData.factionName
			);
		} else if (factionData.missingFavor > 0 && factionData.augMaxRep >= factionData.missingRep) {
			ns.tprintf(
				"%4d + %4d = %4d of %4d favor, %7s %10d rep, for %s",
				factionData.currentFavor,
				factionData.gainedFavor,
				factionData.currentFavor + factionData.gainedFavor,
				favorGoal,
				factionData.missingFavor > 0 ? 'missing' : 'done',
				Math.max(0, factionData.missingRep),
				factionData.factionName
			);
		} else {
			ns.tprintf(
				"%4d + %4d = %4d favor, %3d aug for %14d rep, for %s",
				factionData.currentFavor,
				factionData.gainedFavor,
				factionData.currentFavor + factionData.gainedFavor,
				factionData.augCount,
				Math.max(0, factionData.missingRep),
				factionData.factionName
			);
		}
	}
}