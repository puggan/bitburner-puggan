import type {NS} from '@ns';
import type {ToolList} from '/data/generate/portTools.js';

export default function portTools(ns: NS): ToolList {
    return JSON.parse(ns.read('data/portTools.json.txt'));
}
