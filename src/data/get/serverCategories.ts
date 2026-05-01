import type {NS} from '@ns';
import type {serverByCategory} from '/data/generate/serverCategories.js';

/** @param {NS} ns */
export default function getServerCategories(ns: NS): serverByCategory {
    return JSON.parse(ns.read('data/serverCategories.json.txt'));
}
