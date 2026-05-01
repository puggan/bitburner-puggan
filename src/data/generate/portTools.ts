import type {NS} from '@ns';

export type ToolNames = "BruteSSH" | "FTPCrack" | "relaySMTP" | "HTTPWorm" | "SQLInject";
export type ToolList = Record<ToolNames, boolean>;

/** @param {NS} ns */
export function main(ns: NS) {
    const portTools: ToolList = {
        BruteSSH: ns.fileExists("BruteSSH.exe", "home"),
        FTPCrack: ns.fileExists("FTPCrack.exe", "home"),
        relaySMTP: ns.fileExists("relaySMTP.exe", "home"),
        HTTPWorm: ns.fileExists("HTTPWorm.exe", "home"),
        SQLInject: ns.fileExists("SQLInject.exe", "home"),
    };
    ns.write('data/portTools.json.txt', JSON.stringify(portTools, null, 2), 'w');
}
