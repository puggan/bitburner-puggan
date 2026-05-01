import type {NS, ScriptArg} from '@ns';

/**
 * @param {NS} ns
 * @param {number} pid
 */
export async function waitForPid(ns: NS, pid: number) {
    while (ns.isRunning(pid)) {
        await ns.sleep(100);
    }
}

/**
 * @param {NS} ns
 * @param {string} script
 * @param {ScriptArg[]} args
 */
export async function runAndWait(ns: NS, script: string, ...args: ScriptArg[]): Promise<void> {
    const pid = ns.run(script, {threads: 1, preventDuplicates: true}, ...args);

    if (!pid) {
        ns.tprint(`ERROR: Failed to start ${script}. Possibly not enough RAM?`);
        return;
    }

    await waitForPid(ns, pid);
}

/**
 * @param {NS} ns
 * @param {string[]} scripts
 */
export async function runList(ns: NS, scripts: string[]) {
    for (const script of scripts) {
        const pid = ns.run(script, {threads: 1, preventDuplicates: true});

        if (!pid) {
            ns.tprint(`ERROR: Failed to start ${script}. Possibly not enough RAM?`);
            return;
        }

        await waitForPid(ns, pid);
    }
}

/** @param {NS} ns */
export async function runAll(ns: NS) {
    const scripts = [
        '/data/generate/player.js',
        '/data/generate/portTools.js',
        '/data/generate/serverNames.js',
        '/data/generate/servers.js',
        '/data/generate/serverCategories.js',
    ];
    await runList(ns, scripts);
}

/** @param {NS} ns */
export async function runPlayer(ns: NS) {
    await runList(ns, ['/data/generate/player.js']);
}

/** @param {NS} ns */
export async function main(ns: NS) {
    await runAll(ns);
}