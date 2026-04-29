/**
* @param {NS} ns
**/
export async function main(ns) {
    if (ns.args.length < 1) return;
    /** @type {string} target */
    const target = ns.args[0];
    const moneyThresh = ns.getServerMaxMoney(target) * 0.95;
    const securityThresh = ns.getServerMinSecurityLevel(target);
    while(true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        } else {
            return;
        }
    }
}