import {NS} from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
    await ns.singularity.installBackdoor();
    ns.spawn('/actions/single/goHome.js');
}
