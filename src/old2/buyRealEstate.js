/** @param {NS} ns **/
export async function main(ns) {
  // Arguments: 0 = Division Name, 1 = Goal Amount
  const division = ns.args[0];
  const goal = +ns.args[1];
	const materialName = ns.args[2] || 'Real Estate';

  if (!division || isNaN(goal)) {
    ns.tprint('Usage: run buyRealEstate.js [division] [amount] [materialName] --tail');
		ns.tprint(`Example: run buyMaterial.js SunFood 230400 'Real Estate' --tail`);
    return;
  }

  const matInfo = ns.corporation.getMaterialData(materialName);
  const itemSize = matInfo.size;
  const cities = ['Sector-12', 'Aevum', 'Chongqing', 'New Tokyo', 'Ishima', 'Volhaven'];
  const warehouseMargin = 50;

  ns.disableLog('sleep');

  let allMet = false;
  while (!allMet) {
    allMet = true; 
		let moneyMissing = false;
    ns.print('---------');

    for (const city of cities) {
      const data = ns.corporation.getMaterial(division, city, materialName);
      
      if (data.stored >= goal) {
        ns.print(`[${division} in ${city}] Done`);
				continue;
			} 

      allMet = false;

      const needed = goal - data.stored;
      const affordable = ns.corporation.getCorporation().funds / data.marketPrice;
			if (affordable < needed) {
				moneyMissing = true;
			}

      const warehouse = ns.corporation.getWarehouse(division, city);
      const spaceAvailable = (warehouse.size - warehouseMargin - warehouse.sizeUsed) / itemSize;
			if (spaceAvailable < 1) {
				if (moneyMissing) {
					const requiredFunds = ns.formatNumber(needed * data.marketPrice);
          ns.print(`WARN: [${division} in ${city}] Not enough fund for ${materialName}. ${requiredFunds} required.`);
					continue;
				}
				const warehouseGoal = warehouse.sizeUsed + warehouseMargin + needed * itemSize;
        ns.print(`WARN: [${division} in ${city}] No room for ${materialName}. Increase warehouse size up to ${warehouseGoal.toFixed(0)}`);
				continue;
      }


      const buyAmount = Math.min(needed, spaceAvailable, affordable);

      if (buyAmount < 1) continue;

      ns.print(`[${division} in ${city}] Buying ${buyAmount.toFixed(0)} ${materialName}`);
      ns.corporation.bulkPurchase(division, city, materialName, buyAmount);
    }

		if (moneyMissing) {
			const currentMoney = ns.formatNumber(ns.corporation.getCorporation().funds);
        ns.print(`WARN: Low funds for ${materialName} in ${division} in ${materialName}. current: ${currentMoney}`);
		}

    await ns.sleep(1000); 
  }

  ns.tprint(`Success: ${division} reached ${goal} ${materialName} in all cities.`);
}