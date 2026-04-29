import {NS} from '@ns';

/** @param {NS} ns */
function joinGang(ns: NS) {
    if (!ns.getPlayer().factions.includes('Slum Snakes')) {
        ns.singularity.joinFaction('Slum Snakes');
        return;
    }
    ns.gang.createGang('Slum Snakes');
}

/**
 * @param {NS} ns
 * @param {string[]} members
 */
function printTaskCounter(ns: NS, members: string[]) {
    const taskCounter = {} as { [task: string]: number };
    for (const memberName of members) {
        const memberInfo = ns.gang.getMemberInformation(memberName);
        if (!taskCounter[memberInfo.task]) taskCounter[memberInfo.task] = 0;
        taskCounter[memberInfo.task]++;
    }
    if (members.length < 12) {
        taskCounter.recruiting = 12 - members.length;
    }
    ns.print(JSON.stringify(taskCounter));
}

/**
 * @param {NS} ns
 * @param {string} newRecruitName
 */
function recruit(ns: NS, newRecruitName: string) {
    if (ns.gang.canRecruitMember()) {
        ns.gang.recruitMember(newRecruitName);
        ns.gang.setMemberTask(newRecruitName, 'Train Combat');
        return;
    }
    const gangInfo = ns.gang.getGangInformation();
    const members = ns.gang.getMemberNames();
    const wanted = gangInfo.wantedLevel > 1000 || gangInfo.wantedLevel * 100 > gangInfo.respect && gangInfo.wantedLevel > 10;
    if (wanted) {
        for (const memberName of members) {
            const memberInfo = ns.gang.getMemberInformation(memberName);
            if (memberInfo.task != 'Vigilante Justice') {
                ns.gang.setMemberTask(memberName, 'Vigilante Justice');
            }
        }
        printTaskCounter(ns, members);
        return;
    }
    for (const memberName of members) {
        const ascensionInfo = ns.gang.getAscensionResult(memberName);
        if (ascensionInfo && ascensionInfo.str >= 2) {
            ns.gang.setMemberTask(memberName, 'Train Combat');
            ns.gang.ascendMember(memberName);
            continue;
        }
        const memberInfo = ns.gang.getMemberInformation(memberName);
        if (memberInfo.str < 40) {
            if (memberInfo.task != 'Train Combat') {
                ns.gang.setMemberTask(memberName, 'Train Combat');
            }
            continue;
        }
        if (gangInfo.wantedLevel > 1.5 && memberInfo.task == 'Vigilante Justice') {
            continue;
        }
        if (memberInfo.earnedRespect < 100) {
            if (memberInfo.task != 'Mug People') {
                ns.gang.setMemberTask(memberName, 'Mug People');
            }
            continue;
        }
        if (memberInfo.str < 500) {
            if (memberInfo.task != 'Train Combat') {
                ns.gang.setMemberTask(memberName, 'Train Combat');
            }
            continue;
        }
        if (memberInfo.task != 'Terrorism') {
            ns.gang.setMemberTask(memberName, 'Terrorism');
        }
        continue;
    }
    printTaskCounter(ns, members);
    return;
}

/** @param {NS} ns */
function buyUpgrade(ns: NS) {
    const members = ns.gang.getMemberNames();
    const upgrades = [];
    const allEquipments = ns.gang.getEquipmentNames();
    for (const memberName of members) {
        const memberInfo = ns.gang.getMemberInformation(memberName);
        for (const equipmentName of allEquipments) {
            if (memberInfo.upgrades.includes(equipmentName)) {
                continue;
            }
            if (memberInfo.augmentations.includes(equipmentName)) {
                continue;
            }
            upgrades.push({equipmentName, memberName, price: ns.gang.getEquipmentCost(equipmentName)});
            //ns.printf('Equ: %s for %d', equipmentName, ns.gang.getEquipmentCost(equipmentName));
        }
    }

    if (upgrades.length < 1) {
        return 0;
    }

    upgrades.sort((a, b) => a.price - b.price);

    let purchased = 0;

    let money = ns.getServerMoneyAvailable('home');
    for (const nextUpgrade of upgrades) {
        //if (nextUpgrade.price > 5e6) {
        if (nextUpgrade.price > 1e9) {
            //if (!true) {
            ns.printf('WARN: price out of scop, %s at %s for %s', nextUpgrade.equipmentName, ns.formatNumber(nextUpgrade.price), nextUpgrade.memberName);
            return upgrades.length - purchased;
        }
        if (nextUpgrade.price > money) {
            ns.printf('WARN: To expensive, %s at %s for %s', nextUpgrade.equipmentName, ns.formatNumber(nextUpgrade.price), nextUpgrade.memberName);
            return upgrades.length - purchased;
        }
        ns.printf('%s for %s', nextUpgrade.equipmentName, ns.formatNumber(nextUpgrade.price));
        if (!ns.gang.purchaseEquipment(nextUpgrade.memberName, nextUpgrade.equipmentName)) {
            return upgrades.length - purchased;
        }
        purchased++;
        money = ns.getServerMoneyAvailable('home');
    }

    return 0;
}

/** @param {NS} ns */
function expand(ns: NS) {
    const debugAll = true;
    const gangInfo = ns.gang.getGangInformation();
    const members = ns.gang.getMemberNames();
    const homeMoney = ns.getServerMoneyAvailable("home");
    const moreUpgrades = buyUpgrade(ns);
    const wanted = gangInfo.wantedLevel > 1000 || gangInfo.wantedLevel * 100 > gangInfo.respect && gangInfo.wantedLevel > 10;
    if (wanted) {
        for (const memberName of members) {
            const memberInfo = ns.gang.getMemberInformation(memberName);
            if (memberInfo.task != 'Vigilante Justice') {
                ns.gang.setMemberTask(memberName, 'Vigilante Justice');
            }
        }
        printTaskCounter(ns, members);
        return;
    }

    const uptime = Date.now() - ns.getResetInfo().lastAugReset;
    const startupPeriod = uptime < 3 * 60000;
    const gangRep = ns.singularity.getFactionRep('Slum Snakes');
    for (const memberName of members) {
        const ascensionInfo = ns.gang.getAscensionResult(memberName) || {str: 1};
        if (ascensionInfo && ascensionInfo.str >= 2) {
            ns.gang.setMemberTask(memberName, 'Train Combat');
            ns.gang.ascendMember(memberName);
            if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'Acend', ascensionInfo.str);
            continue;
        }
        const memberInfo = ns.gang.getMemberInformation(memberName);
        if (memberInfo.str < 100) {
            if (memberInfo.task != 'Train Combat') {
                ns.gang.setMemberTask(memberName, 'Train Combat');
            }
            if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'STR < 100', memberInfo.str);
            continue;
        }
        if (gangInfo.wantedLevel > 1.5 && memberInfo.task == 'Vigilante Justice') {
            if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'Wanted', gangInfo.wantedLevel);
            continue;
        }
        if (memberInfo.earnedRespect < 100) {
            if (memberInfo.task != 'Mug People') {
                ns.gang.setMemberTask(memberName, 'Mug People');
            }
            if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%.1f)', memberName, 'Resp < 100', memberInfo.earnedRespect);
            continue;
        }
        if (memberInfo.str_asc_mult < 16) {
            if (homeMoney < 5e6) {
                if (memberInfo.task != 'Terrorism') {
                    ns.gang.setMemberTask(memberName, 'Terrorism');
                }
                if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s < 5m)', memberName, 'Mul < 16', ns.formatNumber(homeMoney, 1));
            } else {
                if (memberInfo.task != 'Train Combat') {
                    ns.gang.setMemberTask(memberName, 'Train Combat');
                }
                if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%.2f x %.2f)', memberName, 'Mul < 16', memberInfo.str_asc_mult, ascensionInfo ? ascensionInfo.str : 0);
            }
            continue;
        }
        if (memberInfo.str < 5000) {
            if (memberInfo.task != 'Train Combat') {
                ns.gang.setMemberTask(memberName, 'Train Combat');
            }
            if (memberName === 'A' || debugAll) {
                ns.printf(
                    'Status %s: %s (%s) with (%.2f x %.2f = %.2f)',
                    memberName,
                    'STR < 5k',
                    memberInfo.str,
                    memberInfo.str_asc_mult,
                    ascensionInfo ? ascensionInfo.str : 0,
                    ascensionInfo ? memberInfo.str_asc_mult * ascensionInfo.str : 0,
                );
                continue;
            }
        }

        if (moreUpgrades > 12 * 11) {
            if (memberInfo.task != 'Human Trafficking') {
                ns.gang.setMemberTask(memberName, 'Human Trafficking');
            }
            if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'Upgraes > 11/member', moreUpgrades);
            continue;
        }

        if (gangInfo.territory > 0.95) {
            if (startupPeriod) {
                if (memberInfo.task != 'Train Combat') {
                    ns.gang.setMemberTask(memberName, 'Train Combat');
                }
                if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'uptime < 3m', uptime / 1000);
                continue;
            }
            if (gangRep < 25e5) {
                if (memberInfo.task != 'Terrorism') {
                    ns.gang.setMemberTask(memberName, 'Terrorism');
                }
                if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'MaxTer & rep < 2M5', gangRep);
                continue;
            } else {
                if (homeMoney < 2e15) {
                    if (memberInfo.task != 'Human Trafficking') {
                        ns.gang.setMemberTask(memberName, 'Human Trafficking');
                    }
                    if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'MaxTer & rep > 2M5', ns.formatNumber(homeMoney, 3));
                    continue;
                }
                if (memberInfo.task != 'Train Combat') {
                    ns.gang.setMemberTask(memberName, 'Train Combat');
                }
                if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'MaxTer & rep > 2M5', ns.formatNumber(memberInfo.str, 3));
                continue;
            }
        }

        if (homeMoney < 1e9) {
            if (memberInfo.task != 'Human Trafficking') {
                ns.gang.setMemberTask(memberName, 'Human Trafficking');
            }
            if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'Money < 1b', ns.formatNumber(homeMoney, 3));
            continue;
        }

        if (gangInfo.territoryClashChance == 0) {
            if (memberInfo.task != 'Territory Warfare') {
                ns.gang.setMemberTask(memberName, 'Territory Warfare');
            }
            if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s) [%s]', memberName, 'Gain Power', ns.formatNumber(gangInfo.power, 1), gangInfo.territoryClashChance);
            continue;
        }

        if (moreUpgrades > 0) {
            if (memberInfo.task != 'Human Trafficking') {
                ns.gang.setMemberTask(memberName, 'Human Trafficking');
            }
            if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'Upgraes > 0', moreUpgrades);
            continue;
        }

        if (homeMoney < 1e14) {
            if (memberInfo.task != 'Human Trafficking') {
                ns.gang.setMemberTask(memberName, 'Human Trafficking');
            }
            if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'Money < 100t', ns.formatNumber(homeMoney, 3));
            continue;
        }

        if (memberInfo.task != 'Train Combat') {
            ns.gang.setMemberTask(memberName, 'Train Combat');
        }
        if (memberName === 'A' || debugAll) ns.printf('Status %s: %s (%s)', memberName, 'Done, Train', ascensionInfo.str);
    }
    printTaskCounter(ns, members);
    return;
}

/** @param {NS} ns */
function gangAction(ns: NS) {
    if (!ns.gang.inGang()) {
        return joinGang(ns);
    }
    const members = ns.gang.getMemberNames();
    if (members.length < 12) {
        return recruit(ns, "ABCDEFGHIJKLM"[members.length]);
    }
    return expand(ns);
}

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.disableLog('sleep');
    if (!ns.singularity.isBusy()) {
        ns.singularity.commitCrime("Mug", true);
    }
    while (true) {
        gangAction(ns);
        await ns.sleep(ns.gang.inGang() && ns.gang.getBonusTime() >= 1000 ? 1000 : 10000);
    }
}