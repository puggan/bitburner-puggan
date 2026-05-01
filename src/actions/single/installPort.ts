import {NS, Server} from '@ns';
import type {ToolList} from "/data/generate/portTools";
import getPortTools from "/data/get/portTools";
import getServers from "/data/get/servers";
import getServerCategories from "/data/get/serverCategories";

export function installAllPorts(ns: NS) {
    const portTools = getPortTools(ns);
    const servers = getServerCategories(ns);
    for (const server of Object.values(servers.missingBackDoor)) {
        installPortServer(ns, server, portTools);
    }
}

/**
 * @param {NS} ns
 * @param {string} host
 * */
export function installPort(ns: NS, host: string) {
    const servers = getServers(ns);

    if (!servers[host]) {
        throw new Error(`No server found for host ${host}`);
    }
    return installPortServer(ns, servers[host], getPortTools(ns));
}

/**
 * @param {NS} ns
 * @param {Server} server
 * @param {ToolList} portTools
 * */
export function installPortServer(ns: NS, server: Server, portTools: ToolList) {
    let openPorts = 0;

    if (server.sshPortOpen) {
        openPorts++;
    } else if (portTools.BruteSSH) {
        ns.brutessh(server.hostname);
        openPorts++;
    }
    if (server.ftpPortOpen) {
        openPorts++;
    } else if (portTools.FTPCrack) {
        ns.ftpcrack(server.hostname);
        openPorts++;
    }
    if (server.smtpPortOpen) {
        openPorts++;
    } else if (portTools.relaySMTP) {
        ns.relaysmtp(server.hostname);
        openPorts++;
    }
    if (server.httpPortOpen) {
        openPorts++;
    } else if (portTools.HTTPWorm) {
        ns.httpworm(server.hostname);
        openPorts++;
    }
    if (server.sqlPortOpen) {
        openPorts++;
    } else if (portTools.SQLInject) {
        ns.sqlinject(server.hostname);
        openPorts++;
    }
    if (server.numOpenPortsRequired && openPorts < server.numOpenPortsRequired) {
        return false;
    }
    if (!server.hasAdminRights) {
        ns.nuke(server.hostname);
    }
    return true;
}

/** @param {NS} ns */
export function main(ns: NS) {
    if (ns.args.length !== 1) {
        throw new Error('Missing hostname');
    }
    const host = '' + ns.args[0];
    installPort(ns, host);
}
