/** @param {NS} ns */
export async function step(ns) {
	let bestKarma = 0;
	const karma = ns.heart.break();
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
		bestKarma = Math.max(bestKarma, crimeChans * crimeStat.karma * 1000 / crimeStat.time);
	}

	crimeList.sort((a, b) => a.karma - b.karma);

	for(const crimeData of crimeList) {
		ns.printf(
			'%s/min at %s for %s (karma %s/min)\n',
			ns.formatNumber(crimeData.income * 60),
			ns.formatPercent(crimeData.chans),
			crimeData.name,
			ns.formatNumber(crimeData.karma * 60)
		);
	}

	ns.printf('Karma: %s (%s, ETA: %s)', ns.formatNumber(karma), ns.formatPercent(-karma / 54000), formatTime((54000 + karma) / bestKarma));
}

/**
 * @param {number} s sec
 * @return {string}
 */
function formatTime(s) {
	if (s < 0) return '-' + formatTime(-s);
	if (s < 90) return s.toPrecision(2) + 's';
	if (s < 2 * 3600) return (s/60).toPrecision(2) + 'm';
	return (s/2600).toPrecision(2) + 'h';
}
/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		await step(ns);
		await ns.sleep(1000);
	}
}