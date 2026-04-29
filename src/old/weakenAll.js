function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

/** @param {NS} ns */
export async function main(ns) {
	const self = ns.getHostname();
	const relay = ns.args.length < 1 ? self : ns.args[0]; 

	const fileContent = ns.read("moneyServers.txt");
	const servers = shuffle(fileContent.split("\r\n"));
	for(const serverName of servers) {
		const freeRam = ns.getServerMaxRam(relay) - ns.getServerUsedRam(relay);
		if (freeRam < 10) {
			return;
		}
		const sLevel = ns.getServerSecurityLevel(serverName);
		const sGaol = ns.getServerMinSecurityLevel(serverName);
		const sStep = ns.weakenAnalyze(1);
		const neededThreads = Math.ceil((sLevel - sGaol) / sStep);
		if (neededThreads > 0) {
			ns.exec("weakenFull.js", "home", 1, serverName, relay);
		}
		await ns.sleep(100);
	}
}