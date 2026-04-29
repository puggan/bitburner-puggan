export function favorToRep(favor) {
	return 25000 * (Math.pow(1.02, favor) - 1);
}

/** @param {NS} ns */
export function joinFactions(ns) {
	const cityFactions = new Set(
		[
			"Aevum",
			"Chongqing",
			"Ishima",
			"New Tokyo",
			"Sector-12",
			"Volhaven",
		]
	);
	const cityJoined = ns.getPlayer().factions.some(f => cityFactions.has(f));
	for (const factionName of ns.singularity.checkFactionInvitations()) {
		if (!cityJoined && cityFactions.has(factionName)) {
			continue;
		}
		ns.singularity.joinFaction(factionName);
	}
}

/** @param {NS} ns */
export async function step(ns) {
	ns.clearLog();
	ns.printf('%s', '-------------------------------------------------------------------------------');
	const playerInfo = ns.getPlayer();
	const currentAugsNames = ns.singularity.getOwnedAugmentations(true);
	const favorGoal = ns.getFavorToDonate();
	const factionList = [];
	const repCost = 1e6 /* 10e6 */ / (ns.getPlayer().mults.faction_rep /* * ns.getPlayer().mults.charisma*/ * ns.getBitNodeMultipliers().FactionWorkRepGain);
	const homeMoney = ns.getServerMoneyAvailable("home");
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
	const factionIcons = {
			"Aevum": "📍",
			"Bachman & Associates": "🏢", 
			"BitRunners": "💻",
			"Blade Industries": "🏢",
			"Chongqing": "📍", 
			"Clarke Incorporated": "🏢",
			"CyberSec": "💻",
			"Daedalus": "👑",
			"ECorp": "🏢",
			"Four Sigma": "🏢",
			"Fulcrum Secret Technologies": "🏢",
			"Illuminati": "👑",
			"Ishima": "📍",
			"KuaiGong International": "🏢",
			"MegaCorp": "🏢",
			"NWO": "🏢", 
			"Netburners": "📡",
			"New Tokyo": "📍",
			"NiteSec": "💻",
			"OmniTek Incorporated": "🏢",
			"Sector-12": "📍",
			"Silhouette": "🔪",
			"Slum Snakes": "🔪",
			"Speakers for the Dead": "🔪", 
			"Tetrads": "🔪",
			"The Black Hand": "💻",
			"The Covenant": "👑",
			"The Dark Army": "🔪",
			"The Syndicate": "🔪",
			"Tian Di Hui": "🧧",
			"Volhaven": "📍",
	};

	const playerFactions = new Set(playerInfo.factions);
	const allFactions = new Set([...intrestingFactions, ...playerFactions]);
	const missingFactions = new Set([...intrestingFactions].filter(f => !playerFactions.has(f)));
	const blockedFactions = new Set([]);

	const citySets = [
		["Volhaven"],
		["Aevum", "Sector-12"],
	  ["Chongqing", "New Tokyo", "Ishima"]
	];

	const selectedCities = citySets.find(cityGroup => cityGroup.find(city => playerFactions.has(city)));
	if (selectedCities) {
		for (const cityGroup of citySets) {
			if (cityGroup == selectedCities) continue;
			for (const city of cityGroup) {
				blockedFactions.add(city);
			}
		}
	}


	for (const factionName of allFactions) {
		const joined = playerFactions.has(factionName);
		const blocked = blockedFactions.has(factionName);
		const factionRep = joined ? ns.singularity.getFactionRep(factionName) : 0;
		const currentFavor = ns.singularity.getFactionFavor(factionName);
		const gainedFavor = ns.singularity.getFactionFavorGain(factionName);
		const favorMult = 1 + currentFavor / 100;

		let factionFavorGoal = favorGoal;
		if (['Slum Snakes'].includes(factionName)) {
			factionFavorGoal = 0;
		}

		const favorTargetRep = favorToRep(factionFavorGoal) - favorToRep(currentFavor);

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

		if (augMaxRep <= favorTargetRep) {
			factionFavorGoal = 0;
		}

		const missingFavor = (factionFavorGoal > currentFavor) ? factionFavorGoal - currentFavor - gainedFavor : 0;
		const targetRep = factionFavorGoal > currentFavor ? Math.min(augMaxRep, favorTargetRep) : augMaxRep;
		const missingRep = targetRep - factionRep;
		const missingRepTotal = augMaxRep - factionRep;

		factionList.push({factionName, currentFavor, gainedFavor, missingFavor, favorMult, factionFavorGoal, missingRep, missingRepTotal, augCount, augMaxRep, targetRep, favorTargetRep, joined, blocked});
	}

	factionList.sort(
		(a, b) => 
			((b.augCount > 0) - (a.augCount > 0)) ||
			((b.joined) - (a.joined)) ||
			((a.missingRep > 0) - (b.missingRep > 0)) ||
			((b.factionFavorGoal > 0) - (a.factionFavorGoal > 0)) ||
			((a.missingRep) - (b.missingRep)) ||
			(b.currentFavor + b.gainedFavor) - (a.currentFavor + a.gainedFavor)
	);

	for (const factionData of factionList) {
		if (!factionData.augMaxRep) {
			if (factionData.joined && false) {
				ns.printf(
					"%4d + %4d = %4d favor, no augmentations left, for %s",
					factionData.currentFavor,
					factionData.gainedFavor,
					factionData.currentFavor + factionData.gainedFavor,
					(factionIcons[factionData.factionName] || "❓") + factionData.factionName + (factionData.joined ? '👥' : '🔒'),
				);
			}
		} else if (factionData.missingRepTotal > 0 && factionData.factionFavorGoal > 0 && factionData.augMaxRep >= factionData.missingRep) {
			if (factionData.missingFavor > 0 || factionData.factionFavorGoal > factionData.currentFavor) {
				ns.printf(
					"%4d + %4d = %4d of %4d favor, %8s %9d rep, for %s",
					factionData.currentFavor,
					factionData.gainedFavor,
					factionData.currentFavor + factionData.gainedFavor,
					favorGoal,
					factionData.joined ? 
						(factionData.missingFavor > 0 ? 'missing' : 'waiting') : 
						(factionData.blocked ? 'blocked' : 'outsider'),
					Math.max(0, factionData.missingFavor > 0 ? factionData.missingRep : factionData.missingRepTotal),
					(factionIcons[factionData.factionName] || "❓") + factionData.factionName + (factionData.joined ? '👥' : '🔒'),
				);
			} else {
				ns.printf(
					"%4d + %4d = %4d of %4d favor, %7s %10d rep, for %s, price: %d (%d%s)",
					factionData.currentFavor,
					factionData.gainedFavor,
					factionData.currentFavor + factionData.gainedFavor,
					favorGoal,
					'done',
					Math.max(0, factionData.missingRep),
					(factionIcons[factionData.factionName] || "❓") + factionData.factionName + (factionData.joined ? '👥' : '🔒'),
					Math.ceil(repCost * Math.max(0, factionData.missingRep) /* / factionData.favorMult*/),
					homeMoney * 100 / Math.ceil(repCost * Math.max(0, factionData.missingRep)),
					'%',
				);
			}
		} else {
			ns.printf(
				"%4d + %4d = %4d favor, %3d aug for %14d rep, for %s",
				factionData.currentFavor,
				factionData.gainedFavor,
				factionData.currentFavor + factionData.gainedFavor,
				factionData.augCount,
				Math.max(0, factionData.missingRep),
				(factionIcons[factionData.factionName] || "❓") + factionData.factionName + (factionData.joined ? '👥' : '🔒'),
			);
		}
	}
}

/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		await joinFactions(ns);
		await step(ns);
		await ns.sleep(10000);
	}
}
