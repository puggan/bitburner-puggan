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
		const money = ns.getServerMoneyAvailable(serverName);
		const moneyGoal = ns.getServerMaxMoney(serverName);
		if (money + money < moneyGoal) {
			ns.exec("prepairFull.js", "home", 1, serverName, relay);
		}
		await ns.sleep(100);
	}
}