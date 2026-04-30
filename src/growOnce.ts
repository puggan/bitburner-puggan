import type {NS} from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
    const target = '' + ns.args[0];
    await ns.grow(target);
}