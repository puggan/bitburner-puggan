import type {NS} from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.exec('scan.js', 'home', {threads: 1, preventDuplicates: true});
    await ns.sleep(1000);
    ns.exec('watch.js', 'home', {threads: 1, preventDuplicates: true}, 10, 'home', 'scan.js');
    ns.exec('watch.js', 'home', {threads: 1, preventDuplicates: true}, 120, 'home', 'buyTools.js');
    ns.exec('watch.js', 'home', {threads: 1, preventDuplicates: true}, 150, 'home', 'backdoorInstall.js');
    //ns.exec('watch.js', 'home', {threads: 1, preventDuplicates: true}, 100, 'home', 'buySizeServers.js', '8T');
    const scriptsToRun = [
        {tail: true, script: 'sleeveMaster.js'},
        {tail: !true, script: 'gangMaster.js'},
        {tail: !true, script: 'h6.js'},
        //{tail: !true, script: 'loopGoldminesThreads.js'},
        {tail: true, script: 'loopFavor.js'},
        {tail: true, script: 'augLoop.js'},
        //{tail: true, script: 'dashboardIncome.js'},
    ];
    for (const scriptToRun of scriptsToRun) {
        const scriptToRunPid = ns.exec(scriptToRun.script, 'home', {threads: 1, preventDuplicates: true});
        if (scriptToRun.tail) {
            ns.ui.openTail(scriptToRunPid);
        }
    }
}
