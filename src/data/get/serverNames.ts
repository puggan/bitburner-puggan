import type {NS} from '@ns';

/** @param {NS} ns */
export default function serverNames(ns: NS): string[] {
    return ns.read('/data/serverNames.txt').split("\n").filter(Boolean);
}