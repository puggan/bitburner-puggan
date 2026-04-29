/**
 * @param {AutocompleteData} data
 * @param {Any[]} args
 **/
export function autocomplete(data, args) {
	return [
		// Combat tasks
		"Train_Combat", 
		"Train_Agility", 
		"Train_Defense", 
		"Train_Dexterity",

		// Criminal tasks
		"Mug_People", 
		"Deal_Drugs", 
		"Strongarm_Civilians", 
		"Run_a_Con", 
		"Armed_Robbery", 
		"Human_Trafficking", 
		"Terrorism",

		// Money tasks
		"Vigilante_Justice", // reduces wanted level
		"Territory_Warfare",

		// Hacking gang tasks (if gang is hacking-focused)
		"Train_Hacking", 
		"Cyberterrorism", 
		"Money_Laundering", 
		"Fraud_&_Counterfeiting",
		"Identity_Theft",

		// Misc
		"Unassigned"
	];
}

/** @param {NS} ns */
export async function main(ns) {
	if (ns.args.length < 1) {
		ns.tprint('No job provided')
		return;
	}
	const task = ns.args.join(' ').replace(/_/g, ' ');
	const members = ns.gang.getMemberNames();
	for(const member of members) {
		ns.gang.setMemberTask(member, task);
	}
	ns.tprintf('Updated %d gang members to %s\n', members.length, task);
}