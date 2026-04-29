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
	const wanted = gangInfo.wantedLevel > 1000 || gangInfo.wantedLevel * 100 > gangInfo.respect && gangInfo.wantedLevel > 10;
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
async function buyUpgrade(ns) {
	const members = ns.gang.getMemberNames();
	const upgrades = [];
	const allEquipments = ns.gang.getEquipmentNames();
	for (const memberName of members) {
		const memberInfo = ns.gang.getMemberInformation(memberName);
		if (memberInfo.upgrades.length + memberInfo.augmentations.length >= 22) {
			continue;
		}
		for (const equipmentName of allEquipments) {
			if (memberInfo.upgrades.includes(equipmentName)) {
				continue;
			}
			if (memberInfo.augmentations.includes(equipmentName)) {
				continue;
			}
			upgrades.push({equipmentName, memberName, price: ns.gang.getEquipmentCost(equipmentName)});
			//ns.printf('Equ: %s for %d', equipmentName, ns.gang.getEquipmentCost(equipmentName));
		}
	}

	if (upgrades.length < 1) {
		return 0;
	}

	upgrades.sort((a, b) => a.price - b.price);

	let purchased = 0;

	for (const nextUpgrade of upgrades) {
		ns.printf('%s for %d', nextUpgrade.equipmentName, nextUpgrade.price);
		if (!ns.gang.purchaseEquipment(nextUpgrade.memberName, nextUpgrade.equipmentName)) {
			return upgrades.length - purchased;
		}
		purchased++;
	}

	return 0;
}

/** @param {NS} ns */
async function expand(ns) {
	const gangInfo = ns.gang.getGangInformation();
	const members = ns.gang.getMemberNames();
	const homeMoney = ns.getServerMoneyAvailable("home");
	const moreUpgrades = await buyUpgrade(ns);
	const wanted = gangInfo.wantedLevel > 1000 || gangInfo.wantedLevel * 100 > gangInfo.respect && gangInfo.wantedLevel > 10;
	if (wanted) {
		for (const memberName of members) {
			const memberInfo = ns.gang.getMemberInformation(memberName);
			if (memberInfo.task != 'Vigilante Justice') {
				ns.gang.setMemberTask(memberName, 'Vigilante Justice');
			}
		}
		return;
	}
	const gangRep = ns.singularity.getFactionRep('Slum Snakes');
	for (const memberName of members) {
		const accendInfo = ns.gang.getAscensionResult(memberName);
		if (accendInfo && accendInfo.str >= 2) {
			ns.gang.setMemberTask(memberName, 'Train Combat');
			ns.gang.ascendMember(memberName);
			if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'Acend', accendInfo.str);
			continue;
		}
		const memberInfo = ns.gang.getMemberInformation(memberName);
		if (memberInfo.str < 100) {
			if (memberInfo.task != 'Train Combat') {
				ns.gang.setMemberTask(memberName, 'Train Combat');
			}
			if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'STR < 100', memberInfo.str);
			continue;
		}
		if (gangInfo.wantedLevel > 1.5 && memberInfo.task == 'Vigilante Justice') {
			if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'Wanted', gangInfo.wantedLevel);
			continue;
		}
		if (memberInfo.earnedRespect < 100) {
			if (memberInfo.task != 'Mug People') {
				ns.gang.setMemberTask(memberName, 'Mug People');
			}
			if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'Resp < 100', memberInfo.earnedRespect);
			continue;
		}
		if (memberInfo.str_asc_mult < 16) {
			if (memberInfo.task != 'Train Combat') {
				ns.gang.setMemberTask(memberName, 'Train Combat');
			}
			if (memberName === 'A') ns.printf('Status %s: %s (%.2f x %.2f)', memberName, 'Mul < 16', memberInfo.str_asc_mult, accendInfo.str);
			continue;
		}
		if (memberInfo.str < 5000) {
			if (memberInfo.task != 'Train Combat') {
				ns.gang.setMemberTask(memberName, 'Train Combat');
			}
			if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'STR < 5k', memberInfo.str);
			continue;
		}
		if (gangInfo.territory > 0.95) {
			if (gangRep < 25e5) {
				if (memberInfo.task != 'Terrorism') {
					ns.gang.setMemberTask(memberName, 'Terrorism');
				}
				if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'MaxTer & rep < 2M5', gangRep);
			} else {
				if (memberInfo.task != 'Human Trafficking') {
					ns.gang.setMemberTask(memberName, 'Human Trafficking');
				}
				if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'MaxTer & rep > 2M5', ns.formatNumber(homeMoney));
			}
			continue;
		}

		if (moreUpgrades > 12 * 11) {
			if (memberInfo.task != 'Human Trafficking') {
				ns.gang.setMemberTask(memberName, 'Human Trafficking');
			}
			if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'Upgraes > 11/member', moreUpgrades);
			continue;
		}

		if (gangInfo.territoryClashChance == 0) {
			if (memberInfo.task != 'Territory Warfare') {
				ns.gang.setMemberTask(memberName, 'Territory Warfare');
			}
			if (memberName === 'A') ns.printf('Status %s: %s (%s) [%s]', memberName, 'Gain Power', gangInfo.power, gangInfo.territoryClashChance);
			continue;
		}

		if (moreUpgrades > 0) {
			if (memberInfo.task != 'Human Trafficking') {
				ns.gang.setMemberTask(memberName, 'Human Trafficking');
			}
			if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'Upgraes > 0', moreUpgrades);
			continue;
		}

		if (homeMoney < 1e16) {
			if (memberInfo.task != 'Human Trafficking') {
				ns.gang.setMemberTask(memberName, 'Human Trafficking');
			}
			if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'Money < 10q', ns.formatNumber(homeMoney));
			continue;
		}

		if (memberInfo.task != 'Train Combat') {
			ns.gang.setMemberTask(memberName, 'Train Combat');
		}
		if (memberName === 'A') ns.printf('Status %s: %s (%s)', memberName, 'Done, Train', accendInfo.str);
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
	return expand(ns);
}

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('sleep');
	while (true) {
		await gangAction(ns);
		await ns.sleep(10000);
	}
}