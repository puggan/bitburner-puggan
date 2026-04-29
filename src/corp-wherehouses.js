/** @param {NS} ns */
export async function main(ns) {
	for (const city of ['Sector-12', 'Aevum', 'Chongqing', 'New Tokyo', 'Ishima', 'Volhaven']) {
		ns.tprint(
			city,
			': ',
			ns.corporation.getWarehouse('SunFood', city).level
		);
	}
}