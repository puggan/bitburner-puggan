import type {NS, Player} from '@ns';

export default function serverNames(ns: NS): Player
{
    return JSON.parse(ns.read('data/player.json.txt'));
}
