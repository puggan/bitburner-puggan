import type {NS, Multipliers} from '@ns';

type FactionRow = {
    name: string;
    rep: number;
    favor: number;
    donatable: boolean | null;
    needRep: number;
}

type AugRow = {
    name: string;
    faction: string;
    price: number;
    preReq: string[];
    rep: number;
    stats: Multipliers;
    owned: boolean;
    available: boolean | null;
}

/** @param {NS} ns */
export async function augments(ns: NS) {
    const donateRequirements = ns.getFavorToDonate();
    const player = ns.getPlayer();
    const factions: FactionRow[] = [];
    const augs: AugRow[] = [];
    const currentAugsNames = ns.singularity.getOwnedAugmentations(true);
    for (const faction of player.factions) {
        const factionData: FactionRow = {
            name: faction,
            rep: ns.singularity.getFactionRep(faction) || -1,
            favor: ns.singularity.getFactionFavor(faction),
            donatable: null,
            needRep: 0,
        };
        factionData.donatable = factionData.favor > donateRequirements;
        for (const aug of ns.singularity.getAugmentationsFromFaction(faction)) {
            const augData: AugRow = {
                name: aug,
                faction,
                price: ns.singularity.getAugmentationBasePrice(aug),
                preReq: ns.singularity.getAugmentationPrereq(aug),
                rep: ns.singularity.getAugmentationRepReq(aug) || 0,
                stats: ns.singularity.getAugmentationStats(aug),
                owned: currentAugsNames.includes(aug),
                available: null,
            }
            augData.available = !augData.owned && augData.rep <= factionData.rep;
            if (augData.name === 'NeuroFlux Governor') {
                augData.available = augData.rep <= factionData.rep;
            }
            augs.push(augData);
            if (!augData.owned && augData.rep > factionData.rep && factionData.needRep < augData.rep) {
                factionData.needRep = augData.rep;
            }
        }
        factions.push(
            factionData
        );
    }
    ns.printf("%d aug loaded", augs.length);
    const availableAugs = augs.filter((a) => a.available);
    ns.printf("%d aug availible", availableAugs.length);
    availableAugs.sort((a, b) => b.price - a.price);
    for (const augData of availableAugs) {
        if (ns.singularity.purchaseAugmentation(augData.faction, augData.name)) {
            ns.printf('Purchases %s from %s', augData.name, augData.faction);
            ns.tprintf('Purchases %s from %s', augData.name, augData.faction);
            return true;
        }
    }
    ns.printf('Nothing purchaseable');
    return false;
}

/** @param {NS} ns */
export async function homeUpgrades(ns: NS) {
    return ns.singularity.upgradeHomeRam() || ns.singularity.upgradeHomeCores();
}

export function ascendGang(ns: NS) {
    if (!ns.gang.inGang()) return;
    for (const name of ns.gang.getMemberNames()) {
        ns.gang.ascendMember(name);
    }
}

/** @param {NS} ns */
export async function main(ns: NS) {
    while (await augments(ns)) {
        await ns.sleep(1000);
    }
    while (await homeUpgrades(ns)) {
        await ns.sleep(1000);
    }
    ascendGang(ns);
    ns.singularity.installAugmentations('startup.js');
}
