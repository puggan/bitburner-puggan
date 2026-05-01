import {NS} from '@ns';

/** @param {NS} ns */
export function main(ns: NS) {
    const fullPlayer = ns.getPlayer();
    const limitedPlayer = {
        money: fullPlayer.money,
        numPeopleKilled: fullPlayer.numPeopleKilled,
        entropy: fullPlayer.entropy,
        jobs: fullPlayer.jobs,
        factions: fullPlayer.factions,
        totalPlaytime: fullPlayer.totalPlaytime,
        location: fullPlayer.location,
        karma: fullPlayer.karma,
    };
    ns.write('data/player.json.txt', JSON.stringify(limitedPlayer, null, 2), 'w');
}