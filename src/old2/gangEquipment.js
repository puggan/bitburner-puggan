/** @param {NS} ns */
async function buyUpgrade(ns) {
	const members = ns.gang.getMemberNames();
	const upgrades = [];
	const allEquipments = ns.gang.getEquipmentNames();
	for (const memberName of members) {
		const memberInfo = ns.gang.getMemberInformation(memberName);
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
export async function main(ns) {
	await buyUpgrade(ns);
}