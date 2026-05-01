import {NS, Player} from '@ns';

/** @param {NS} ns */
export function main(ns: NS) {
    const fullPlayer = ns.getPlayer();
    const limitedPlayer: Player = {
        city: fullPlayer.city,
        entropy: fullPlayer.entropy,
        exp: fullPlayer.exp,
        factions: fullPlayer.factions,
        hp: fullPlayer.hp,
        jobs: fullPlayer.jobs,
        karma: fullPlayer.karma,
        location: fullPlayer.location,
        money: fullPlayer.money,
        mults: fullPlayer.mults,
        numPeopleKilled: fullPlayer.numPeopleKilled,
        skills: fullPlayer.skills,
        totalPlaytime: fullPlayer.totalPlaytime,
    };
    ns.write('data/player.json.txt', JSON.stringify(limitedPlayer, null, 2), 'w');
}