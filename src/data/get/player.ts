import type {NS, Player} from '@ns';

/** @param {NS} ns */
export default function getPlayer(ns: NS): Player {
    return JSON.parse(ns.read('data/player.json.txt'));
}
