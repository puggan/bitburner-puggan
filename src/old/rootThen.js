/** @param {NS} ns */
export async function main(ns) {
	if (ns.args.length < 1) {
		ns.tprint('run rootThen.js <target> <script> <threads> <parameters..>');
		return;
	}
	const serverName = ns.args[0];
	if (serverName == 'home') {
		ns.tprint('Invalid target');
		ns.tprint('run rootThen.js <target> <script> <threads> <parameters..>');
		return;
	}
	const server = ns.getServer(serverName);
	if (!server || server.purchasedByPlayer) {
		ns.tprint('Invalid target');
		ns.tprint('run rootThen.js <target> <script> <threads> <parameters..>');
		return;
	}

	while(!server.hasAdminRights) {
		const pLvl = ns.getHackingLevel();
		const portTools = [
			ns.fileExists("BruteSSH.exe", "home"),
			ns.fileExists("FTPCrack.exe", "home"),
			ns.fileExists("relaySMTP.exe", "home"),
			ns.fileExists("HTTPWorm.exe", "home"),
			ns.fileExists("SQLInject.exe", "home"),
		];
		const maxPorts = portTools.filter(b => b).length;

		if (server.numOpenPortsRequired > maxPorts) {
			await ns.sleep(5000);
			continue;
		}

		if (portTools[0] && !server.sshPortOpen) {
			ns.brutessh(serverName);
		}
		if (portTools[1] && !server.ftpPortOpen) {
			ns.ftpcrack(serverName);
		}
		if (portTools[2] && !server.smtpPortOpen) {
			ns.relaysmtp(serverName);
		}
		if (portTools[3] && !server.httpPortOpen) {
			ns.httpworm(serverName);
		}
		if (portTools[4] && !server.sqlPortOpen) {
			ns.sqlinject(serverName);
		}
		ns.nuke(serverName);
		break;
	}
	if (ns.args.length > 1) {
		const script = ns.args[1];
		const threads = +(ns.args[2] || 1);
		const parameters = ns.args.slice(3);
		ns.tprint('run rootThen.js <target> <script> <threads> <parameters..>');
		ns.tprint('run %s -t %d %s @ %s', script, threads, parameters.join(' '), serverName);
		ns.exec(script, serverName, threads || 1, ...parameters);
	}
}