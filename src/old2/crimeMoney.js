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
				stat: crimeStat
			}
		);
	}
	crimeList.sort((a, b) => a.income - b.income);
	for(const crimeData of crimeList) {
		ns.tprintf(
			'%s/min at %s for %s (karma %s/min)\n',
			ns.formatNumber(crimeData.income * 60),
			ns.formatPercent(crimeData.chans),
			crimeData.name,
			ns.formatNumber(crimeData.karma * 60)
		);
	}
}