/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep');
	let startTime = Date.now();
	let startMoney = ns.getServerMoneyAvailable("home");
	let startSources = ns.getMoneySources().sinceStart;
	let startShares = 0; // ns.corporation.getCorporation().numShares;
	delete startSources.total;
  ns.clearLog();
  ns.print(`--- INCOME DASHBOARD (60s Sample) at ${(new Date(startTime)).toLocaleString('en-SE')} ---`);
	ns.print(' ... loading first snapshots');

	while (true) {
		await ns.sleep(60000);

		const endTime = Date.now();
		const endMoney = ns.getServerMoneyAvailable("home");
		const endSources = ns.getMoneySources().sinceStart;
		const endShares = 0; // ns.corporation.getCorporation().numShares;
	  delete endSources.total;

		const durationSeconds = (endTime - startTime)/1000;

		ns.clearLog();
		ns.print(`--- INCOME DASHBOARD (${durationSeconds}s Sample) at ${(new Date(endTime)).toLocaleString('en-SE')} ---`);
		ns.print(` Category           | Delta        | Rate (/s)   | Income %`);
		ns.print(`--------------------|--------------|-------------|----------`);

		let totalGain = 0;
		for (const [category, value] of Object.entries(endSources)) {
			const delta = value - startSources[category];
			if (delta > 0) totalGain += delta;
		}

		for (const [category, value] of Object.entries(endSources)) {
			if (Math.abs(value) < 1) continue;
			const delta = value - startSources[category];

			ns.print(
				` ${category.padEnd(18)} | ` +
				`${ns.formatNumber(delta).padStart(12)} | ` +
				`${ns.formatNumber(delta / durationSeconds).padStart(9)}/s | ` +
				`${ns.formatPercent(totalGain ? delta / totalGain : 0).padStart(9)}`
			);
		}

		ns.print(`--------------------|--------------|-------------|----------`);
		ns.print(` Net Wallet Change:    ${ns.formatNumber(endMoney - startMoney).padStart(9)}`);
		//ns.print(` Shares Change Change: ${ns.formatNumber(endShares - startShares).padStart(9)}`);
		ns.print(`------------------------------------------------------------`);

		startTime = endTime;
		startMoney = endMoney;
		startSources = endSources;
		startShares = endShares;
	}
}