/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('sleep');
	const karmaGoal = -54000;
	const startKarma = ns.heart.break();
	const startTime = Date.now();
	ns.tprintf('Karma: %d @ %s, %d%s of %d', startKarma, (new Date(startTime)).toLocaleString('en-SE'), 100 * startKarma / karmaGoal, '%', karmaGoal);
	ns.printf('Karma: %d @ %s, %d%s of %d', startKarma, (new Date(startTime)).toLocaleString('en-SE'), 100 * startKarma / karmaGoal, '%', karmaGoal);
	let karma = startKarma;
	while (karma > karmaGoal) {
    karma = ns.heart.break();
		const currentTime = Date.now();
		const karmaDelta = karma - startKarma;
		const timeDelta = currentTime - startTime;
		const missingKarma = karmaGoal - karma;
		const karmaSpeed = karmaDelta / timeDelta;
		if (karmaSpeed) {
			const missingTime = missingKarma / karmaSpeed;
			const estDate = new Date(currentTime + missingTime);
			ns.printf('Karma: %d @ %s, %d%s of %d -> %s', karma, (new Date(currentTime)).toLocaleString('en-SE'), 100 * karma / karmaGoal, '%', karmaGoal, estDate.toLocaleString('en-SE'));
		}
		await ns.sleep(10000);
	}
}