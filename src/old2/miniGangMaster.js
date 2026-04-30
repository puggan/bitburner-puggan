/** @param {NS} ns */
async function joinGang(ns) {
	if (!ns.singularity.isBusy()) {
		ns.singularity.commitCrime("Mug", true);
	}
	if (!ns.getPlayer().factions.includes('Slum Snakes')) {
		ns.singularity.joinFaction('Slum Snakes');
		return;
	}
	ns.gang.createGang('Slum Snakes');
}

/** @param {NS} ns */
async function recruit(ns, newRecruitName) {
	if (ns.gang.canRecruitMember()) {
		ns.gang.recruitMember(newRecruitName);
		ns.gang.setMemberTask(newRecruitName, 'Train Combat');
		return;
	}
	const gangInfo = ns.gang.getGangInformation();
	const members = ns.gang.getMemberNames();
	const wanted = gangInfo.wantedLevel > 100 || gangInfo.wantedLevel * 100 > gangInfo.respect && gangInfo.wantedLevel > 10;
	if (wanted) {
		for (const memberName of members) {
			const memberInfo = ns.gang.getMemberInformation(memberName);
			if (memberInfo.task != 'Vigilante Justice') {
				ns.gang.setMemberTask(memberName, 'Vigilante Justice');
			}
		}
		return;
	}
	for (const memberName of members) {
		const accendInfo = ns.gang.getAscensionResult(memberName);
		if (accendInfo && accendInfo.str >= 2) {
			ns.gang.setMemberTask(memberName, 'Train Combat');
			ns.gang.ascendMember(memberName);
			continue;
		}
		const memberInfo = ns.gang.getMemberInformation(memberName);
		if (memberInfo.str < 40) {
			if (memberInfo.task != 'Train Combat') {
				ns.gang.setMemberTask(memberName, 'Train Combat');
			}
			continue;
		}
		if (gangInfo.wantedLevel > 1.5 && memberInfo.task == 'Vigilante Justice') {
			continue;
		}
		if (memberInfo.earnedRespect < 100) {
			if (memberInfo.task != 'Mug People') {
				ns.gang.setMemberTask(memberName, 'Mug People');
			}
			continue;
		}
		if (memberInfo.str < 500) {
			if (memberInfo.task != 'Train Combat') {
				ns.gang.setMemberTask(memberName, 'Train Combat');
			}
			continue;
		}
		if (memberInfo.task != 'Terrorism') {
			ns.gang.setMemberTask(memberName, 'Terrorism');
		}
		continue;
	}
	return;
}

/** @param {NS} ns */
async function gangAction(ns) {
	if (!ns.gang.inGang()) {
		return joinGang(ns);
	}
	const members = ns.gang.getMemberNames();
	if (members.length < 12) {
		return recruit(ns, "ABCDEFGHIJKLM"[members.length]);
	}
	throw new Error('Time to run the full code');
}

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('sleep');
	while (true) {
		await gangAction(ns);
		await ns.sleep(10000);
	}
}