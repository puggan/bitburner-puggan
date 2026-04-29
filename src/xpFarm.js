/** @param {NS} ns */
export async function main(ns) {
	const host = ns.getHostname();
	const script = 'weakenMultiple.js';
	ns.scp(script, host, 'home');
	const target = 'foodnstuff';
	while (true) {
		const maxRam = ns.getServerMaxRam(host)
		const usedRam = ns.getServerUsedRam(host);
		const freeRam = maxRam - usedRam - (host === 'home' ? 34 : 0);
		const scriptRam = ns.getScriptRam(script);
		const threads = Math.floor(freeRam / scriptRam);
		if (threads < 1) {
			ns.print('out of ram => sleeping');
			await ns.sleep(1000);
			continue;
		}
		ns.print(threads + 'x ' + script + ' ' + target);
		const pid = ns.run(script, threads, target);		
		do {
			await ns.sleep(100);
		} while(ns.isRunning(script, host, target));
	}
}