/** @param {NS} ns */
export function main(ns) {
	let s = 0;
	let o = 0;
	/** @type {string} fileContent */
	const fileContent = ns.read("serverList.txt");
	for(const server of fileContent.split("\r\n")) {
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