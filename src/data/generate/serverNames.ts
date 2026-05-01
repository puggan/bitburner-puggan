import type {NS} from '@ns';

/** @param {NS} ns */
export function main(ns: NS) {
    const serverNames: Set<string> = new Set(['home']);
    const serverNeighbors: Record<string, string[]> = {};
    const todo: string[] = [...serverNames];
    while (todo.length > 0) {
        const nextServer = todo.shift();
        if (!nextServer) continue;
        const foundServers = ns.scan(nextServer);
        serverNeighbors[nextServer] = foundServers;
        for (const serverName of foundServers) {
            if (serverNames.has(serverName)) {
                continue;
            }
            todo.push(serverName);
            serverNames.add(serverName);
        }
    }
    ns.write('data/serverNames.txt', [...serverNames].sort().join("\n"), 'w');
    ns.write('data/serverNeighbors.json.txt', JSON.stringify(serverNeighbors, null, 2), 'w');
}
