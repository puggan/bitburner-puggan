/** @param {NS} ns */
export async function main(ns) {
	ns.exec('scan.js', 'home', {threads: 1, preventDuplicates: true});
	await ns.sleep(1000);
	ns.exec('watch.js', 'home', {threads: 1, preventDuplicates: true}, 10, 'home', 'scan.js');
	//ns.exec('watch.js', 'home', {threads: 1, preventDuplicates: true}, 100, 'home', 'buyServers.js');
	ns.exec('watch.js', 'home', {threads: 1, preventDuplicates: true}, 150, 'home', 'backdoorInstall.js');
	ns.ui.openTail(ns.exec('gangCheep.js', 'home', {threads: 1, preventDuplicates: true}));
	ns.ui.openTail(ns.exec('h6.js', 'home', {threads: 1, preventDuplicates: true}));
	ns.ui.openTail(ns.exec('loopGoldminesThreads.js', 'home', {threads: 1, preventDuplicates: true}));
	ns.ui.openTail(ns.exec('loopFavor.js', 'home', {threads: 1, preventDuplicates: true}));
}