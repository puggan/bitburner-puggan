/** @param {NS} ns **/
export async function main(ns) {
    let corpInfo = ns.corporation.getCorporation();
    ns.tprint(`Starting buyback script. Outstanding shares: ${ns.formatNumber(corpInfo.totalShares - corpInfo.numShares)}`);
		ns.disableLog('sleep');

    while (corpInfo.totalShares > corpInfo.numShares) {
				await ns.sleep(1000);
        corpInfo = ns.corporation.getCorporation();
        const myMoney = ns.getServerMoneyAvailable("home");
        const canAfford = Math.floor(0.75 * myMoney / corpInfo.sharePrice);

        ns.print(`--- ${new Date().toLocaleString('en-SE')} ---`);
        ns.print(`Outstanding: ${ns.formatNumber(corpInfo.totalShares - corpInfo.numShares)}`);
        ns.print(`Price: ${ns.formatNumber(corpInfo.sharePrice)} -> ${ns.formatNumber(corpInfo.sharePrice * (corpInfo.totalShares - corpInfo.numShares))}`);

        if (canAfford < 100) {
	        ns.print(`I can buy: ${ns.formatNumber(canAfford)}`);
					continue;
				}

				const buyAmount = Math.min(canAfford, 1 + ((corpInfo.totalShares - corpInfo.numShares - 1) % 1e8));
				
				ns.print(`Action: Buying ${ns.formatNumber(buyAmount)} shares`);
				ns.corporation.buyBackShares(buyAmount);
    }

    ns.tprint("SUCCESS: Corporation is now 100% privately owned!");
}