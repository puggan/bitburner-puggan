/**
* @param {NS} ns
**/
export async function main(ns) {
    /** @type {string} target */
    const target = ns.args[0];
    await ns.hack(target);
}