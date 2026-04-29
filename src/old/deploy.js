/**
 * @param {AutocompleteData} data - context about the game, useful when autocompleting
 * @param {string[]} args - current arguments, not including "run script.js"
 * @returns {string[]} - the array of possible autocomplete options
 */
export function autocomplete(data, args) {
	switch (args.length) {
		case 1:
			return data.hostname;
		case 2:
			return data.scripts;
		default:
			return [];
	}
}

/**
 * @param {NS} ns
 * @author ???
 */
export async function main(ns) {
	const homeOffset = 200;
	/** @type {_: string[], ?help: boolean} args */
	const args = ns.flags([["help", false]]);
	if (args.help || args._.length < 2) {
		ns.tprint("This script deploys another script on a server with maximum threads possible.");
		ns.tprint(`Usage: run ${ns.getScriptName()} HOST SCRIPT ARGUMENTS`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} n00dles basic_hack.js foodnstuff`);
		return;
	}

	const host = args._[0];
	const script = args._[1];
	const script_args = args._.slice(2);

	if (!ns.serverExists(host)) {
		ns.tprint(`Server '${host}' does not exist. Aborting.`);
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
		ns.tprint(`Launching script '${script}' on server '${host}' with the following arguments: ${script_args}`);
		await ns.scp(script, host, ns.getHostname());
		if (args.length < 3) {
			ns.exec(script, host, 1, host);
		} else {
			ns.exec(script, host, 1, ...script_args);
		}
	} else {
		ns.tprint(`Failed to launching script '${script}' on server '${host}' with the following arguments: ${script_args}`);
	}
	ns.tprint(host + ': ' + ns.getServerUsedRam(host) + ' of ' + ns.getServerMaxRam(host) + ' RAM');
}