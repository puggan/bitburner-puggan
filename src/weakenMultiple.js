/**
* @param {NS} ns
**/
export async function main(ns) {
    /** @var {string} target */
    const target = ns.args[0];
    let count = ns.args[1] || 100;
		while(count-- > 0) {
	    await ns.weaken(target);
		}
}