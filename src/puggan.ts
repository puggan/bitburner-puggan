import { NS } from '@ns';
/** @param {NS} ns */
export async function main(ns: NS) {
	/*
	for (const city of ['Sector-12', 'Aevum', 'Chongqing', 'New Tokyo', 'Ishima', 'Volhaven']) {
		ns.tprint(
			city,
			': ',
			ns.corporation.getWarehouse('SunFood', city).level
		);
	}
	*/

	ns.tprint('Rep-multiplier: ', ns.getPlayer().mults.faction_rep);
	ns.tprint('Charisma: ', ns.getPlayer().mults.charisma);
	ns.tprint('Rep-factor: ', ns.getPlayer().mults.faction_rep * ns.getPlayer().mults.charisma);
	ns.tprint('ns.getBitNodeMultipliers().FactionWorkRepGain: ', ns.getBitNodeMultipliers().FactionWorkRepGain)

  const homeRam = ns.getServerMaxRam('home');
  const maxRam = ns.getPurchasedServerMaxRam();
  const startRam = Math.min(homeRam / 2, maxRam / 4);
	const serverCost = ns.getPurchasedServerCost(startRam);
	ns.tprint('HomeRam: ', ns.formatRam(homeRam));
	ns.tprint('NewServer ', ns.formatRam(startRam), ': ', ns.formatNumber(serverCost));
	ns.tprint("Current Kills: " + ns.getPlayer().numPeopleKilled);
}
