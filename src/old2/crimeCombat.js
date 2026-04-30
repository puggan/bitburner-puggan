/** @param {NS} ns */
export async function main(ns) {
	ns.tprintf('Karma: %d', ns.heart.break());
	const crimeList = [];
	for(const crimeName of Object.values(ns.enums.CrimeType)) {
		const crimeStat = ns.singularity.getCrimeStats(crimeName);
		const crimeChans = ns.singularity.getCrimeChance(crimeName);
		crimeList.push(
			{
				name: crimeName,
				chans: crimeChans,
				income: crimeChans * crimeStat.money * 1000 / crimeStat.time,
				karma: crimeChans * crimeStat.karma * 1000 / crimeStat.time,
				combat: crimeChans * (crimeStat.strength_exp + crimeStat.defense_exp + crimeStat.dexterity_exp + crimeStat.agility_exp) * 250 / crimeStat.time,
				stat: crimeStat
			}
		);
	}
	crimeList.sort((a, b) => a.combat - b.combat);
	for(const crimeData of crimeList) {
		ns.tprintf(
			'%s/min at %s for %s (combat %s/min)\n',
			ns.formatNumber(crimeData.income * 60),
			ns.formatPercent(crimeData.chans),
			crimeData.name,
			ns.formatNumber(crimeData.combat * 60)
		);
	}
}