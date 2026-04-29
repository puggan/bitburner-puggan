/** @param {NS} ns */
export async function main(ns) {
    const target = ns.getHostname();
    const moneyThresh = ns.getServerMaxMoney(target);
    const securityThresh = ns.getServerMinSecurityLevel(target);
    const ram = ns.getServerMaxRam(target);
    const programRam = 2.2;
    const threads = Math.floor(ram / programRam);
	ns.tprint('run h2.js ' + target + ' -t ' + threads + ' ' + moneyThresh + ' ' + securityThresh);
}