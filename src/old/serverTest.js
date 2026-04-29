import servers from "serverList.js"; 

/** @param {NS} ns */
export function main(ns) {
	let s = 0;
	let o = 0;
	for(const server of servers()) {
		s++;
		if (ns.serverExists(server)) {
			ns.tprint('ok: ' + server);
			o++;
		} else {
			ns.tprint('missing: ' + server);
		}
	}
	ns.tprint(o + ' of ' + s + ' servers found');
}