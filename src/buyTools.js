export function buyTools(ns) {
  const torPrice = 200000;
  const hasTor = ns.hasTorRouter();
  let money = ns.getServerMoneyAvailable("home");

  const toolNames = [
    'BruteSSH.exe',
    'FTPCrack.exe',
    'relaySMTP.exe',
    'HTTPWorm.exe',
    'SQLInject.exe',
	];

  const missingTools = toolNames
  	.filter(toolName => !ns.fileExists(toolName, "home"))
	  .map(
			toolName => (
				{
    			name: toolName,
			    price: ns.singularity.getDarkwebProgramCost(toolName)
			  }
			)
		);

  if (missingTools.length < 1) return false;
	const cheapestTool = Math.min(...missingTools.map(row => row.price));

	if (!hasTor) {
		if (money < (torPrice + cheapestTool.price)) return false;

		if (!ns.singularity.purchaseTor()) {
			return false;
		}
		ns.tprint("Purchased TOR router.");
		money = ns.getServerMoneyAvailable("home");
	}

	let upgrades = 0;
	for (const tool of missingTools) {
		if (money < tool.price) continue;

		if (!ns.singularity.purchaseProgram(tool.name)) {
			return upgrades > 0;
		}
		upgrades++;
		ns.tprint(`Purchased ${tool.name}`);
		money = ns.getServerMoneyAvailable("home");
	}

	return upgrades > 0;
}

export function buyHomeRam(ns) {
  const money = ns.getServerMoneyAvailable("home");
  if (ns.singularity.getUpgradeHomeRamCost() > money) return false;
	if (ns.singularity.upgradeHomeRam()) {
		ns.tprint("Upgraded Home RAM!");
		return true;
	}
  return false;
}

/** @param {NS} ns */
export function main(ns) {
	buyTools(ns);
	buyHomeRam(ns);
}
