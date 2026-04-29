/** @param {NS} ns */
export async function main(ns) {
    if (ns.args.length < 1) return;
	/** @type {string} target */
    const target = ns.args[0];
    const relay = ns.args.length < 2 ? ns.getHostname() : ns.args[1];

	const gScript = 'growOnce.js';
	const wScript = 'weakenOnce.js';

	if (relay !== 'home') {
		await ns.scp([gScript, wScript, 'hackOnce.js'], 'home', relay);
	}

	const freeRam = ns.getServerMaxRam(relay) - ns.getServerUsedRam(relay);
	const gScriptSize = ns.getScriptRam(gScript);
	const wScriptSize = ns.getScriptRam(wScript);

	const money = ns.getServerMoneyAvailable(target);
	const moneyGoal = ns.getServerMaxMoney(target);
	const missingMoney = moneyGoal - money;
	if (money < 1) {
		ns.tprint('Broken @ ' + target);
		return;
	}
	const gNeededThreads = Math.ceil(ns.growthAnalyze(target, moneyGoal / money));

	const sLevel = ns.getServerSecurityLevel(target);
	const sGaol = ns.getServerMinSecurityLevel(target);
	const sStep = ns.weakenAnalyze(1);
	const wNeededThreads = Math.ceil((sLevel - sGaol) / sStep);

	const wMaxThreads = Math.floor(freeRam / wScriptSize);
	const growThreads = wNeededThreads > wMaxThreads ? 0 : Math.min(gNeededThreads, Math.floor((freeRam - wNeededThreads * wScriptSize) / gScriptSize));

	const nsIncrease = growThreads > 0 ? ns.growthAnalyzeSecurity(growThreads, target, 1) : 0;
	const weakenThreads = Math.min(wMaxThreads, Math.ceil((nsIncrease + sLevel - sGaol) / sStep));

	if (growThreads) {
		ns.tprint(growThreads, 'x ', gScript, ' ', target, ' from ', relay);
		ns.exec(gScript, relay, growThreads, target);
		if (weakenThreads) {
			const wTime = ns.getWeakenTime(target);
			const gTime = ns.getGrowTime(target);
			if (gTime > wTime) {
				await ns.sleep(gTime - wTime);
			}
		}
	}

	if (weakenThreads) {
		ns.tprint(weakenThreads, 'x ', wScript, ' ', target, ' from ', relay);
		ns.exec(wScript, relay, weakenThreads, target);
	}
}