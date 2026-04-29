/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		ns.printf('== %s ==', 'GangInfo');
		const GangInfo = ns.gang.getGangInformation();
		ns.printf('%s: %s', 'Territory', ns.formatPercent(GangInfo.territory));
		ns.printf('%s: %s', 'Power', ns.formatNumber(GangInfo.power));
		ns.printf('%s: %s', 'Respect', ns.formatNumber(GangInfo.respect));
		ns.printf('%s: %s', 'WantedLevel', ns.formatNumber(GangInfo.wantedLevel));
		ns.printf('%s: %s', 'WantedPenalty', ns.formatNumber(GangInfo.wantedPenalty));
		await ns.sleep(5000);
	}
}