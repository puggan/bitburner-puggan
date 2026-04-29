/**
 * @param {NS} ns
 **/
export async function main(ns) {
    if (ns.args.length < 3) {
        ns.tprint('syntax error, parameters: <target> <relay> <maxThreads>');
        return;
    }

    // parameters
    /** @type {string} target */
    const target = ns.args[0];
    /** @type {string} relay */
    const relay = ns.args[1];
    const scriptMaxThreads = +ns.args[2];

    // Config
	const homeOffset = 10; //50;
    const hackScript = 'hackOnce.js';
    const growScript = 'growOnce.js';
    const weakenScript = 'weakenOnce.js';

    // auto-config
    const moneyThresh = ns.getServerMaxMoney(target) * 0.95;
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    let relayMaxRam = ns.getServerMaxRam(relay);
    const memThresh = relayMaxRam - ns.getScriptRam(hackScript) * scriptMaxThreads;

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
            return;
        }
        ns.print(threads + 'x ' + script + ' ' + target + ' from ' + relay);
        ns.exec(script, relay, threads, target);
        return memPerScript * threads;
    };

    ns.disableLog('sleep');
    ns.disableLog('getServerUsedRam');
    if (relay !== 'home') {
        await ns.scp([hackScript, growScript, weakenScript], 'home', relay);
    }

    // main loop
    while(true) {
        await ns.sleep(1000);
        let ram = ns.getServerUsedRam(relay);
        while (ram > memThresh) {
            await ns.sleep(1000);
            ram = ns.getServerUsedRam(relay);
        }

        if (relay === 'home') {
            // reserv some memory at home
            ram += homeOffset;
        }

        relayMaxRam = ns.getServerMaxRam(relay);
        const weakenRequired = ns.getServerSecurityLevel(target) > securityThresh;
        const currentMoney = ns.getServerMoneyAvailable(target);
        const growRequired = currentMoney < moneyThresh;

        if (currentMoney < 1) {
            ns.print('Server bankrupt');
            return;
        }

        if (weakenRequired) {
            // Weaken 100%
            ram += relayScript(weakenScript, relayMaxRam - ram, scriptMaxThreads);
            continue;
        }

        if (growRequired) {
            // Grow 100%
            ram += relayScript(growScript, relayMaxRam - ram, scriptMaxThreads);
            continue;
        }

        // Hack 
        const moneyPartPerThread = ns.hackAnalyze(target);
        const maxThreads = Math.floor(0.45 / moneyPartPerThread);
        if (maxThreads < 1) {
            ns.print('single hack takes more the 45%');
            return;
        }
        ram += relayScript(hackScript, relayMaxRam - ram, maxThreads);
 
        const growTime = ns.getGrowTime(target);
        const hackTime = ns.getHackTime(target);
        if (isFinite(hackTime) && hackTime > growTime) {
            await ns.sleep(50 + hackTime - growTime);        
            // Grow if memory left
            ram += relayScript(growScript, relayMaxRam - ram, scriptMaxThreads - maxThreads);
            await ns.sleep(50 + growTime);        
        } else {
            // Grow if memory left
            ram += relayScript(growScript, relayMaxRam - ram, scriptMaxThreads - maxThreads);
            await ns.sleep(50 + hackTime);        
        }
        ns.print(ns.nFormat(maxThreads * moneyPartPerThread * ns.getServerMaxMoney(target), '0 a') + ' from hacking ' + target + ' from ' + relay)
    }
}