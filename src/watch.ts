import type {NS, AutocompleteData} from '@ns';

/**
 * @param {AutocompleteData} data
 * @param {string[]} args
 */
export function autocomplete(data: AutocompleteData, args: string[]) {
    switch (args.length) {
        case 2:
            return data.hostname;
        case 3:
            return data.scripts;
        default:
            return [];
    }
}

/** @param {NS} ns */
export async function main(ns: NS) {
    const sec = parseFloat('' + ns.args[0]);
    const host = '' + ns.args[1];
    const script = '' + ns.args[2];
    const scriptArgs = ns.args.slice(3);
    while (true) {
        const pid = ns.exec(script, host, 1, ...scriptArgs);
        await ns.sleep(sec * 1000);
        while (ns.isRunning(pid)) {
            await ns.sleep(100);
        }
    }
}