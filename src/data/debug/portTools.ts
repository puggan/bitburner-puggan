import type {NS} from '@ns';
import getPortTools from "/data/get/portTools.js";

/** @param {NS} ns */
export async function main(ns: NS) {
    const list = getPortTools(ns);
    for (const [toolName, toolInstalled] of Object.entries(list)) {
        const toolIcon = toolInstalled ? '✅' : '❌';
        ns.tprint(toolIcon + ' ' + toolName);
    }
}
