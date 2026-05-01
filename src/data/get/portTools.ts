import type {NS} from '@ns';
import type {ToolList} from '/data/generate/portTools.js';

/** @param {NS} ns */
export default function getPortTools(ns: NS): ToolList {
    return JSON.parse(ns.read('data/portTools.json.txt'));
}
