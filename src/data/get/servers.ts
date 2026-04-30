import type {NS, Server} from '@ns';

export default function serverNames(ns: NS): {[serverName: string]: Server}
{
    return JSON.parse(ns.read('data/servers.json.txt'));
}
