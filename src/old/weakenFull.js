/** @param {NS} ns */
export async function main(ns) {
    if (ns.args.length < 1) return;
	/** @type {string} target */
    const target = ns.args[0];
    const relay = ns.args.length < 2 ? ns.getHostname() : ns.args[1];

	const script = 'weakenOnce.js';
	const scriptSize = ns.getScriptRam(script);
	const freeRam = ns.getServerMaxRam(relay) - ns.getServerUsedRam(relay);
	const maxThreads = Math.floor(freeRam / scriptSize);
	if (maxThreads < 1) {
		ns.tprint('OOM @ ' + relay);
		return;
	}
	const sLevel = ns.getServerSecurityLevel(target);
	const sGaol = ns.getServerMinSecurityLevel(target);
	const sStep = ns.weakenAnalyze(1);
	const neededThreads = Math.ceil((sLevel - sGaol) / sStep);
	if (neededThreads < 1) {
		ns.tprint('NOP @ ' + target);
		return;
	}
	const threads = Math.min(neededThreads, maxThreads);
	ns.tprint(threads, 'x ', script, ' ', target, ' from ', relay);
	ns.exec(script, relay, threads, target);
}