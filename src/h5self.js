/**
 * @param {NS} ns
 **/
export async function main(ns) {
    if (ns.args.length < 2) {
        ns.tprint('syntax error, parameters: <target> <maxThreads>');
        return;
    }

    // parameters
    /** @type {string} target */
    const target = ns.args[0];
    const scriptMaxThreads = +ns.args[1];
		const relay = ns.getHostname();

    // Config
    const hackScript = 'hackOnce.js';
    const growScript = 'growOnce.js';
    const weakenScript = 'weakenOnce.js';

    // auto-config
    const moneyThresh = ns.getServerMaxMoney(target) * 0.95;
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    const singleThreadRamNeeded = ns.getScriptRam(hackScript);
    const ramNeeded = singleThreadRamNeeded * scriptMaxThreads;
    const lowRamNeeded = singleThreadRamNeeded * 100;

    /**
     * Relay script execution
     * @param {string} script
     * @param {number} freeRam
     * @param {number} maxThreads
     */
    const relayScript = (script, freeRam, maxThreads) => {
        let memPerScript = ns.getScriptRam(script);
        let threads = Math.floor(freeRam / memPerScript);
        if (threads > maxThreads) {
            threads = maxThreads;
        }
        if (threads < 1) {
            return 0;
        }
        ns.print(threads + 'x ' + script + ' ' + target + ' from ' + relay);
        ns.exec(script, relay, threads, target);
        return memPerScript * threads;
    };

    ns.disableLog('sleep');
    ns.disableLog('getServerUsedRam');
    for (const relay of ns.getPurchasedServers()) {
        await ns.scp([hackScript, growScript, weakenScript], relay, 'home');
    }

    // main loop
    while(true) {
        await ns.sleep(1000);
        ns.print('Relay selected ' + relay);

        const ram = ns.getServerUsedRam(relay);
        const maxRam = ns.getServerMaxRam(relay);
        let freeRam = maxRam - ram;
        if (freeRam < singleThreadRamNeeded) {
            continue;
        }

        const weakenRequired = ns.getServerSecurityLevel(target) > securityThresh;
        const currentMoney = ns.getServerMoneyAvailable(target);
        const growRequired = currentMoney < moneyThresh;

        if (currentMoney < 1) {
            ns.print('Server bankrupt');
            return;
        }

        const weakenTime = ns.getWeakenTime(target);
        const growTime = ns.getGrowTime(target);
        const hackTime = ns.getHackTime(target);

        if (weakenRequired) {
            // Weaken 100%
            relayScript(weakenScript, freeRam, scriptMaxThreads);
            await ns.sleep(50 + weakenTime);
            continue;
        }

        if (growRequired) {
            // Grow 100%
            relayScript(growScript, freeRam, scriptMaxThreads);
            await ns.sleep(50 + growTime);
            continue;
        }

        // Hack 
        const moneyPartPerThread = ns.hackAnalyze(target);
        const maxThreads = Math.floor(0.45 / moneyPartPerThread);
        if (maxThreads < 1) {
            ns.print('single hack takes more the 45%');
            return;
        }
        freeRam -= relayScript(hackScript, freeRam, maxThreads);

        if (isFinite(hackTime) && hackTime > growTime) {
            await ns.sleep(50 + hackTime - growTime);        
            // Grow if memory left
            relayScript(growScript, freeRam, scriptMaxThreads - maxThreads);
            await ns.sleep(50 + growTime);        
        } else {
            // Grow if memory left
            const extraRamUsed = relayScript(growScript, freeRam, scriptMaxThreads - maxThreads);
            await ns.sleep(50 + hackTime);
            if (extraRamUsed) {
                await ns.sleep(50 + growTime - hackTime);
            }
        }
        const currentMoneyAfter = ns.getServerMoneyAvailable(target);
        if (currentMoneyAfter >= currentMoney) {
            ns.print('Failed hacking ' + target + ' from ' + relay)
        } else {
            ns.print(ns.formatNumber(currentMoneyAfter - currentMoney) + ' from hacking ' + target + ' from ' + relay)
        }
    }
}