/**
 * @param {NS} ns
 **/
export async function main(ns) {
    const maxRam = ns.getPurchasedServerMaxRam();
    const ram = maxRam / 16;
    const cost = ns.getPurchasedServerCost(ram);
    const maxServers = ns.getPurchasedServerLimit();
    const currentServers = ns.getPurchasedServers();

    let serverCount = currentServers.length;
    if (serverCount >= maxServers) {
        ns.tprint('Max servers');
        return;
    }

    let money = ns.getServerMoneyAvailable("home");
    if (money < cost) {
        ns.tprint('Low Money');
				ns.tprint(cost)
				ns.tprint(cost/1e9 + 'b')
        return;
    }

    const serverPrefix = '64TB';
    const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXYZ';
    if (serverCount < maxServers && money >= cost) {
        let suffixIndex = 0;
        while (currentServers.indexOf(serverPrefix + alpha.charAt(suffixIndex)) >= 0 || ns.serverExists(serverPrefix + alpha.charAt(suffixIndex))) {
            suffixIndex++;
            await ns.sleep(100);
        }
        const serverName = serverPrefix + alpha.charAt(suffixIndex);
        ns.purchaseServer(serverName, ram)
        money -= cost;
        serverCount++;
        currentServers.push(serverName);
        ns.tprint('New server: ' + serverName);
        await ns.sleep(100);
    }
}