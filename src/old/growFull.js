/** @param {NS} ns */
export async function main(ns) {
    if (ns.args.length < 1) return;
	/** @type {string} target */
    const target = ns.args[0];
    const relay = ns.args.length < 2 ? ns.getHostname() : ns.args[1];

	const script = 'growOnce.js';
	const scriptSize = ns.getScriptRam(script);
	const freeRam = ns.getServerMaxRam(relay) - ns.getServerUsedRam(relay);
	const maxThreads = Math.floor(freeRam / scriptSize);
	if (maxThreads < 1) {
		ns.tprint('OOM @ ' + relay);
		return;
	}
	const money = ns.getServerMoneyAvailable(target);
	const moneyGoal = ns.getServerMaxMoney(target);
	const missingMoney = moneyGoal - money;
	if (missingMoney < 1) {
		ns.tprint('Full @ ' + target);
		return;
	}
	if (money < 1) {
		ns.tprint('Broken @ ' + target);
		return;
	}
	const neededThreads = Math.ceil(ns.growthAnalyze(target, moneyGoal / money));
	if (neededThreads < 1) {
		ns.tprint('NOP @ ' + target);
		return;
	}
	const threads = Math.min(neededThreads, maxThreads);
	ns.tprint(threads, 'x ', script, ' ', target, ' from ', relay);
	ns.exec(script, relay, threads, target);
}