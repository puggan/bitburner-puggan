import {NS} from '@ns';
import {installAllPorts} from "/actions/single/installPort";

/** @param {NS} ns */
export function main(ns: NS) {
    installAllPorts(ns);
}
