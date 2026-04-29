import {NS, FactionWorkType} from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
    const favorGoal = ns.getFavorToDonate();
    // List of company factions to prioritize (Adjust as needed)
    const companies = [
        "Bachman & Associates",
        "Blade Industries",
        "Clarke Incorporated",
        "Fulcrum Technologies",
        "ECorp",
        "MegaCorp",
        "KuaiGong International",
        "Four Sigma",
        "NWO",
        "OmniTek Incorporated",
    ] as const;
    const factions = [
        "Sector-12",
        "Chongqing",
        "New Tokyo",
        "Ishima",
        "Aevum",
        "Volhaven",

        "NiteSec",
        "The Black Hand",
        "BitRunners",

        "CyberSec",
        "Tian Di Hui",
        "Netburners",
        "Slum Snakes",
        "Tetrads",
        "Silhouette",
        "Speakers for the Dead",
        "The Dark Army",
        "The Syndicate",
        "The Covenant",
        "Daedalus",
        "Illuminati"
    ] as const;
    let inGang = false;
    let karma = 0;

    const handleSleeve = function (sleeveIndex: number) {
        const stats = ns.sleeve.getSleeve(sleeveIndex);
        const task = ns.sleeve.getTask(sleeveIndex);
        ns.printf("Sleeve %d was doing task %s", sleeveIndex, task?.type || '-');

        // 1. SHOCK RECOVERY
        if (stats.shock > 0) {
            if (task?.type !== "RECOVERY") {
                ns.sleeve.setToShockRecovery(sleeveIndex);
            }
            ns.printf("Sleeve %d: recovery [%s]", sleeveIndex, ns.formatPercent(stats.shock / 100));
            return;
        }

        // 2. SYNCHRONIZE
        if (stats.sync < 100) {
            if (task?.type !== "SYNCHRO") {
                ns.sleeve.setToSynchronize(sleeveIndex);
            }
            ns.printf("Sleeve %d: sync [%s]", sleeveIndex, ns.formatPercent(stats.sync / 100));
            return;
        }

        // 3. KARMA GRIND (If no gang)
        // Note: ns.gang.inGang() requires Gang API access.
        // If you don't have it yet, check ns.heart.break()
        if (!inGang) {
            const statsSum = stats.skills.strength + stats.skills.defense + stats.skills.dexterity + stats.skills.agility;
            if (statsSum < 400) {
                if (!task?.type || task?.type === "RECOVERY") {
                    ns.sleeve.setToCommitCrime(sleeveIndex, "Mug");
                    ns.printf("Sleeve %d: karma-crime Mug [%s/400]", sleeveIndex, ns.formatNumber(statsSum));
                    return;
                }
                ns.printf("Sleeve %d: karma-combat %s [%s/400]", sleeveIndex, task.type, ns.formatNumber(statsSum));
                return;
            }
            if (task?.type !== "CRIME" || task?.crimeType !== "Homicide") {
                ns.sleeve.setToCommitCrime(sleeveIndex, "Homicide");
            }
            ns.printf("Sleeve %d: karma-crime Homicide [%s]", sleeveIndex, ns.formatNumber(karma));
            return;
        }

        // 3. FACTION / COMPANY WORK
        // Check Companies first
        for (const companyName of companies) {
            if (ns.getPlayer().factions.includes(companyName)) {
                const companyFavor = ns.singularity.getFactionFavor(companyName) + ns.singularity.getFactionFavorGain(companyName);
                if (companyFavor < favorGoal) {
                    if (task?.type !== "FACTION" || task?.factionName !== companyName) {
                        const workPrio = [
                            FactionWorkType.security,
                            FactionWorkType.field,
                            FactionWorkType.hacking,
                        ];
                        const possibleWork = new Set(ns.singularity.getFactionWorkTypes(companyName));
                        if (!possibleWork.size) continue;
                        try {
                            const preferredWork = workPrio.find(workType => possibleWork.has(workType));
                            if (!preferredWork) {
                                continue;
                            }
                            ns.sleeve.setToFactionWork(sleeveIndex, companyName, preferredWork);
                        } catch (e) {
                            continue;
                        }
                    }
                    const freshTask = ns.sleeve.getTask(sleeveIndex);
                    ns.printf("Sleeve %d: company-faction-work %s for %s [%s]", sleeveIndex, freshTask?.type === 'FACTION' ? freshTask.factionWorkType : '', companyName, ns.formatNumber(companyFavor));
                    return;
                }
                continue;
            }

            if (!ns.getPlayer().jobs[companyName]) continue;

            const companyRep = ns.singularity.getCompanyRep(companyName);
            if (companyRep > 3e5) continue;

            if (task?.type !== "COMPANY" || task?.companyName !== companyName) {
                try {
                    ns.sleeve.setToCompanyWork(sleeveIndex, companyName);
                } catch (e) {
                    continue;
                }
            }
            ns.printf("Sleeve %d: employment-work for %s [%s]", sleeveIndex, companyName, ns.formatNumber(companyRep));
            return;
        }

        // 4. Check General Factions
        for (let factionName of factions) {
            const factionFavor = ns.singularity.getFactionFavor(factionName) + ns.singularity.getFactionFavorGain(factionName);
            if (ns.getPlayer().factions.includes(factionName) && factionFavor < favorGoal) {
                if (task?.type !== "FACTION" || task?.factionName !== factionName) {
                    const workPrio = [
                        FactionWorkType.security,
                        FactionWorkType.field,
                        FactionWorkType.hacking,
                    ];
                    const possibleWork = new Set(ns.singularity.getFactionWorkTypes(factionName));
                    if (!possibleWork.size) continue;
                    try {
                        const preferredWork = workPrio.find(workType => workType && possibleWork.has(workType));
                        if (!preferredWork) {
                            continue;
                        }
                        ns.sleeve.setToFactionWork(sleeveIndex, factionName, preferredWork);
                    } catch (e) {
                        continue;
                    }
                }
                const freshTask = ns.sleeve.getTask(sleeveIndex);
                ns.printf("Sleeve %d: faction-work %s for %s [%s]", sleeveIndex, (freshTask?.type === "FACTION" ? freshTask.factionWorkType : '-'), factionName, ns.formatNumber(factionFavor));
                return;
            }
        }

        ns.printf("Sleeve %d: FREE", sleeveIndex);
    };

    while (true) {
        const numSleeves = ns.sleeve.getNumSleeves();

        if (!inGang) {
            karma = ns.heart.break();
            inGang = ns.gang.inGang() || karma <= -54000
        }

        for (let sleeveIndex = 0; sleeveIndex < numSleeves; sleeveIndex++) {
            handleSleeve(sleeveIndex);
        }

        await ns.sleep(10000); // Check every 10 seconds
        ns.clearLog()
    }
}