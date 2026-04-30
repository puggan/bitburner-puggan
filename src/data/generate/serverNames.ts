import type {NS} from '@ns';

export function main(ns: NS) {
    const serverNames: Set<string> = new Set(['home']);
    const todo: string[] = [...serverNames];
    while (todo.length > 0) {
        const nextServer = todo.shift();
        if (!nextServer) continue;
        const foundServers = ns.scan(nextServer);
        for (const serverName of foundServers) {
            if (serverNames.has(serverName)) {
                continue;
            }
            todo.push(serverName);
            serverNames.add(serverName);
        }
    }
    ns.write('data/serverNames.txt', [...serverNames].join("\n"), 'w');
}
