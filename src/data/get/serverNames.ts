import type {NS} from '@ns';

/** @param {NS} ns */
export default function getServerNames(ns: NS): string[] {
    return ns.read('/data/serverNames.txt').split("\n").filter(Boolean);
}