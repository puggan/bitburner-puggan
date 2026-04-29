/** @param {NS} ns **/
export function buyTea(ns) {
	let teaCount = 0;
	const corpInfo = ns.corporation.getCorporation();
	for (const divisionName of corpInfo.divisions) {
		if (ns.corporation.hasResearched(divisionName, "AutoBrew")) continue;

		const division = ns.corporation.getDivision(divisionName);
		for (const city of division.cities) {
			const office = ns.corporation.getOffice(divisionName, city);

			if (office.avgEnergy < 95) {
				ns.print(`Tea for ${divisionName} in ${city}, Energy was at ${office.avgEnergy}`);
				ns.corporation.buyTea(divisionName, city);
				teaCount++;
			}
		}
	}
	if (!teaCount) ns.print('No Tea was needed');
}

/** @param {NS} ns **/
export function party(ns) {
	let partyCount = 0;
	const corpInfo = ns.corporation.getCorporation();
	for (const divisionName of corpInfo.divisions) {
		if (ns.corporation.hasResearched(divisionName, "AutoPartyManager")) continue;

		const division = ns.corporation.getDivision(divisionName);
		for (const city of division.cities) {
			const office = ns.corporation.getOffice(divisionName, city);

			if (office.avgMorale < 95) {
				ns.print(`Party for ${divisionName} in ${city}, Morale was at ${office.avgMorale}`);
				ns.corporation.throwParty(divisionName, city, 40000);
				partyCount++;
			}
		}
	}
	if (!partyCount) ns.print('No Party was needed');
}

/** @param {NS} ns **/
export async function main(ns) {
	while (true) {
		ns.clearLog();
		buyTea(ns);
		party(ns);
		await ns.sleep(10000);
	}
}