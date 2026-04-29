/** @param {NS} ns **/
export async function main(ns) {
	const homeOffset = 10;
	/** @type {string} host */
	const host = ns.args[0];
	/** @type {string} target */
	const target = ns.args[1];
	const script = 'h2.js';

	if (!ns.serverExists(host)) {
		ns.tprint(`Server '${host}' does not exist. Aborting.`);
		return;
	}
	if (!ns.serverExists(target)) {
		ns.tprint(`Server '${target}' does not exist. Aborting.`);
		return;
	}
	if (!ns.ls(ns.getHostname()).find(f => f === script)) {
		ns.tprint(`Script '${script}' does not exist. Aborting.`);
		return;
	}

	let freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
	if (host === 'home') {
		freeRam -= homeOffset;
	}
	const threads = Math.floor(freeRam / ns.getScriptRam(script));
	if (threads > 0) {
		const script_args = [
			target,
	    	ns.getServerMaxMoney(target) * 0.75,
	    	ns.getServerMinSecurityLevel(target) + 5
		];

		ns.tprint(`Launching script '${script}' on server '${host}' with ${threads} threads and the following arguments: ${script_args}`);
		await ns.scp(script, ns.getHostname(), host);
		ns.exec(script, host, threads, ...script_args);
	}
	ns.tprint(host + ': ' + ns.getServerUsedRam(host) + ' of ' + ns.getServerMaxRam(host) + ' RAM');
}