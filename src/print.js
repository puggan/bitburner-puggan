/**
 * @param {AutocompleteData} data - context about the game, useful when autocompleting
 * @param {string[]} args - current arguments, not including "run script.js"
 * @returns {string[]} - the array of possible autocomplete options
 */
export function autocomplete(data, args) {
  return args.length > 1 ? [] : data.txts;
}

/** @param {NS} ns */
export async function main(ns) {
	ns.tprint(ns.read(ns.args[0]));
}