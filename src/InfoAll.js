/** @param {NS} ns */
export async function main(ns) {
	// if(true) {
	while(true) {
		ns.printf('== %s ==', 'GangInfo');
		const GangInfo = ns.gang.getGangInformation();
		ns.printf('%s: %s', 'Territory', ns.formatPercent(GangInfo.territory));
		ns.printf('%s: %s', 'Power', ns.formatNumber(GangInfo.power));
		ns.printf('%s: %s', 'Respect', ns.formatNumber(GangInfo.respect));
		ns.printf('%s: %s', 'WantedLevel', ns.formatNumber(GangInfo.wantedLevel));
		ns.printf('%s: %s', 'WantedPenalty', ns.formatNumber(GangInfo.wantedPenalty));
		let worstChans = 1;
		if (GangInfo.territory < 1) {
			const gangInfos = ns.gang.getOtherGangInformation();
			for (const otherGangKey of Object.keys(gangInfos)) {
				if (GangInfo.faction === otherGangKey) {
					continue;
				}
				if (gangInfos[otherGangKey].territory <= 0) {
					continue;
				}
				worstChans = Math.min(worstChans, ns.gang.getChanceToWinClash(otherGangKey));
				//ns.printf('%s: %s', otherGangKey, ns.formatPercent(ns.gang.getChanceToWinClash(otherGangKey)));
			}
		}
		ns.printf('%s: %s', 'ChanceToWinClash', ns.formatPercent(worstChans));

		ns.printf('== %s ==', 'HackInfo');
		//const PlayerInfo = ns.getPlayer();
		const nextServerLvl = parseInt(ns.read('lvl.txt'));
		const hackLvl = ns.getHackingLevel();
		ns.printf('%s: %s', 'HackLvl', hackLvl);
		if (hackLvl > 0) {
			ns.printf('%s: %s', 'Next Server at', nextServerLvl);
			if (hackLvl < nextServerLvl) {
				ns.printf('%s: %s', 'Status', (nextServerLvl - hackLvl) + ' Missing levels');
			} else {
				ns.printf('%s: %s', 'Status', 'Ready to hack');
			}
		} else {
			ns.printf('%s: %s', 'Status', 'Done');
		}
		await ns.sleep(5000);
	}
}