import type {NS} from '@ns';

async function waitForPid(ns: NS, pid: number) {
    while (ns.isRunning(pid)) {
        await ns.sleep(100);
    }
}

export async function runAll(ns: NS)
{
    const scripts = [
        '/data/generate/player.js',
        '/data/generate/portTools.js',
        '/data/generate/serverNames.js',
        '/data/generate/servers.js',
    ];
    for (const script of scripts) {
        const pid = ns.run(script, {threads: 1, preventDuplicates: true});

        if (!pid) {
            ns.tprint(`ERROR: Failed to start ${script}. Possibly not enough RAM?`);
            return;
        }

        await waitForPid(ns, pid);
    }
}

export async function main(ns: NS)
{
    await runAll(ns);
}