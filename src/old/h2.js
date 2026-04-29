/**
* @param {NS} ns
**/
export async function main(ns) {
    if (ns.args.length < 3) return;
    /** @type {string} target */
    const target = ns.args[0];
    const moneyThresh = ns.args[1] /*ns.getServerMaxMoney(target)*/ * 0.75;
    const securityThresh = ns.args[2] /*ns.getServerMinSecurityLevel(target)*/ + 5;
    while(true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}