export async function main(ns) {
    const servers = ['home', ...ns.getPurchasedServers()];
    for (const server of servers) {
        const maxRam = ns.getServerMaxRam(server);
        const userRam = ns.getServerUsedRam(server);
        const freeRam = maxRam - userRam;
        const freeRamB = ns.nFormat(freeRam * (1 << 30), '0 bi');
        const freeRamP = ns.nFormat(freeRam / maxRam, '0 %');
        ns.tprint('# ' + server + ': ' + freeRamB + ' (' + freeRamP + ')');
        const processes = ns.ps(server);
        if (processes.length < 0) {
            ns.tprint('  (?) 0x NOP');
            continue;
        }
        for (const process of processes) {
            ns.tprint('  (' + process.pid + ') ' + process.threads + 'x ' + process.filename + ' ' + process.args.join(' '));
        }
    }
}