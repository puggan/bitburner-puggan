/** @param {NS} ns */
export async function main(ns) {
	const gangInfo = ns.gang.getGangInformation();
	const members = ns.gang.getMemberNames();
	const membersToAccend = [];
	for(const member of members) {
		const memberInfo = ns.gang.getMemberInformation(member);
		const accendInfo = ns.gang.getAscensionResult(member);
		if (!accendInfo) {
			ns.tprintf('Member %s multiplier %s x %s (%s)', member, memberInfo.str_asc_mult, 0, 'too soon');
			continue;
		}
		if (accendInfo.str < 2) {
			ns.tprintf('Member %s multiplier %s x %s (%s)', member, memberInfo.str_asc_mult, accendInfo.str, 'too low');
			continue;
		}
		if (memberInfo.earnedRespect * 2 > gangInfo.respect) {
			ns.tprintf('Member %s multiplier %s x %s (%s)', member, memberInfo.str_asc_mult, accendInfo.str, 'solo respect');
			continue;
		}
		membersToAccend.push(
			{
				name: member,
				multiplier: accendInfo.str,
				memberInfo,
				accendInfo,
			}
		);
		ns.tprintf('Member %s multiplier %s x %s (%s)', member, memberInfo.str_asc_mult, accendInfo.str, 'ok');
	}
	if (!membersToAccend.length) {
			ns.tprintf('Done, nothing todo');
			return;
	}
	membersToAccend.sort((a, b) => b.multiplier - a.multiplier);
	ns.tprintf('Accend %s (%s)', membersToAccend[0].name, membersToAccend[0].multiplier);
	ns.gang.setMemberTask(membersToAccend[0].name, 'Train Combat');
	ns.gang.ascendMember(membersToAccend[0].name);
}