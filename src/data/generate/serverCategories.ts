import type {NS, Server} from '@ns';
import getPlayer from '/data/get/player.js';
import servers from '/data/get/servers.js';
import getPortTools from "/data/get/portTools.js";

export type serverCategoryKeys =
    "my"
    | "backDoored"
    | "missingBackDoor"
    | "money"
    | "portMissing"
    | "levelMissing"
    | "ignored";
export type serverByCategory = Record<serverCategoryKeys, Record<string, Server>>;

/** @param {NS} ns */
export function main(ns: NS) {
    const list = servers(ns);
    const player = getPlayer(ns);
    const portTools = getPortTools(ns);
    const portToolCount = Object.values(portTools).filter(Boolean).length;
    const serverByCategory: serverByCategory = {
        my: {},
        backDoored: {},
        missingBackDoor: {},
        money: {},
        portMissing: {},
        levelMissing: {},
        ignored: {},
    };
    for (const [serverName, serverInfo] of Object.entries(list)) {
        if (serverName === 'home') {
            serverByCategory.my[serverName] = serverInfo;
            continue;
        }
        if (serverName === 'darkweb') {
            serverByCategory.ignored[serverName] = serverInfo;
            continue;
        }
        if (serverInfo.purchasedByPlayer) {
            serverByCategory.my[serverName] = serverInfo;
            continue;
        }
        if (serverInfo.backdoorInstalled) {
            serverByCategory.backDoored[serverName] = serverInfo;
            if (serverInfo.moneyAvailable && serverInfo.moneyAvailable > 0) {
                serverByCategory.money[serverName] = serverInfo;
            }
            continue;
        }
        if (serverInfo.requiredHackingSkill && serverInfo.requiredHackingSkill > player.skills.hacking) {
            serverByCategory.levelMissing[serverName] = serverInfo;
            continue;
        }
        if (serverInfo.numOpenPortsRequired && serverInfo.numOpenPortsRequired > portToolCount) {
            serverByCategory.portMissing[serverName] = serverInfo;
            continue;
        }
        serverByCategory.missingBackDoor[serverName] = serverInfo;
        if (serverInfo.moneyAvailable && serverInfo.moneyAvailable > 0) {
            serverByCategory.money[serverName] = serverInfo;
        }
    }
    ns.write('data/serverByCategory.json.txt', JSON.stringify(serverByCategory, null, 2), 'w');
}
