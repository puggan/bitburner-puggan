/**
 * @param {NS} ns
 **/
export async function main(ns) {
    // Config
    const growScript = 'growOnce.js';
    const weakenScript = 'weakenOnce.js';
 
    /**
     * Relay script execution
     * @param {string} script
     * @param {number} freeRam
     * @param {number} maxThreads
     */
    const relayScript = (script, relay, freeRam, target) => {
        let memPerScript = ns.getScriptRam(script);
        let threads = Math.floor(freeRam / memPerScript);
        if (threads < 1) {
            return 0;
        }
        ns.print(threads + 'x ' + script + ' ' + target + ' from ' + relay);
        ns.exec(script, relay, threads, target);
        return memPerScript * threads;
    };

    ns.disableLog('ALL');
 
    // main loop
    while(true) {
        await ns.sleep(1000);
        ns.exec('goldmines.js', 'home', 1);
        await ns.sleep(100);
        const moneyServers = ns.read("moneyServers.txt").split("\r\n");
        let target = '';
        let targetWeakenTime = Infinity;
        let targetGrowTime = Infinity;
        for (const sreverName of moneyServers) {
            const securityThresh = ns.getServerMinSecurityLevel(sreverName) + 5;
            const weakenRequired = ns.getServerSecurityLevel(sreverName) > securityThresh;
            if (weakenRequired) {
                if (isFinite(targetGrowTime)) {
                    continue;
                }
                const weakenTime = ns.getWeakenTime(sreverName);
                if (weakenTime < targetWeakenTime) {
                    target = sreverName;
                    targetWeakenTime = weakenTime;
                }
                continue;
            }

            const moneyThresh = ns.getServerMaxMoney(sreverName);
            const currentMoney = ns.getServerMoneyAvailable(sreverName);
            const growRequired = currentMoney > 0 && currentMoney < moneyThresh;
            if (!growRequired) {
                continue;
            }
            const growTime = ns.getGrowTime(sreverName);
            if (growTime < targetGrowTime) {
                target = sreverName;
                targetGrowTime = growTime;
            }
        }
        if (!isFinite(targetWeakenTime) && !isFinite(targetGrowTime)) {
            for (const sreverName of moneyServers) {
                const securityThresh = Math.ceil(ns.getServerMinSecurityLevel(sreverName));
                const weakenRequired = ns.getServerSecurityLevel(sreverName) > securityThresh;
                if (weakenRequired) {
                    const weakenTime = ns.getWeakenTime(sreverName);
                    if (weakenTime < targetWeakenTime) {
                        target = sreverName;
                        targetWeakenTime = weakenTime;
                    }
                    continue;
                }
            }
        }

        if (target == '') {
            continue;
        }
        const relay = 'home';
        const ram = ns.getServerUsedRam(relay);
        const maxRam = ns.getServerMaxRam(relay);
        const freeRam = maxRam - ram;
        const startDate = new Date;

        if (isFinite(targetGrowTime)) {
            const endDate = new Date(startDate.getTime() + targetGrowTime);
            if(relayScript(growScript, relay, freeRam, target)) {
                ns.tprint(startDate.toISOString().substr(11, 8) + ' grow ' + target + ' until ' + endDate.toISOString().substr(11, 8))
                await ns.sleep(targetGrowTime - 500);
            }
            continue;
        }
        if (isFinite(targetWeakenTime)) {
            const endDate = new Date(startDate.getTime() + targetWeakenTime);
            if(relayScript(weakenScript, relay, freeRam, target)) {
                ns.tprint(startDate.toISOString().substr(11, 8) + ' weaken ' + target + ' until ' + endDate.toISOString().substr(11, 8))
                await ns.sleep(targetWeakenTime - 500);
            }
            continue;
        }
    }
}