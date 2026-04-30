import type {NS} from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
    const colSize = 15;
    const maxRam = ns.getPurchasedServerMaxRam();
    const maxServers = ns.getPurchasedServerLimit();

    ns.tprintf(
        "%s ║ %s ║ %s ║ %s",
        "Size".padStart(colSize),
        "All Price".padStart(colSize),
        "New Price".padStart(colSize),
        "Upgrade (x2)".padStart(colSize)
    );
    ns.tprintf(('╬' + "═".repeat(colSize + 2)).repeat(4).substring(2));


    for (let ram = 2; ram <= maxRam; ram <<= 1) {
        const newPrice = ns.getPurchasedServerCost(ram);
        const upgradePrice = newPrice - (ns.getPurchasedServerCost(ram / 2) / 2);

        ns.tprintf(
            "%s ║ %s ║ %s ║ %s",
            ns.formatRam(ram).padStart(colSize),
            ns.formatNumber(newPrice * maxServers).padStart(colSize),
            ns.formatNumber(newPrice).padStart(colSize),
            ns.formatNumber(upgradePrice).padStart(colSize)
        );
    }
    ns.tprintf(('╩' + "═".repeat(colSize + 2)).repeat(4).substring(2));
}