"use strict";

const Web3 = require('web3');
const ConsentLib = require('consentlib');
const Solc = require('solc');
const FS = require("fs");

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://node0:8545'));

let whisper = new ConsentLib.Whisper(web3);
let consentFlow = new ConsentLib.ConsentFlow(web3, whisper, Solc);

let email = process.argv[2];
let passphrase = process.argv[3];
let identity = whisper.newIdentity();
let address = process.argv[4];
let ttl = 100;
let priority = 100;

let accountUnlocked = web3.personal.unlockAccount(address, passphrase);
let source = FS.readFileSync('./PayingBackContract.sol', 'utf8');

consentFlow.discoverIdentityService((err, result, idServiceAddress) => {

    setTimeout(() => consentFlow.registerWhisperId(identity, idServiceAddress, email, ttl, priority), 200);

    setTimeout(() => {
        consentFlow.lookupWhisperIds(identity, idServiceAddress, [
            "umbrella-corp1@example.com",
            "goliath-national-bank@example.com"
        ], ttl, priority, 9000).then((whisperIds) =>
            consentFlow.lookupEthAddresses(identity, whisperIds, ttl, priority, 9000)
        ).then((ethAdresses) =>
            consentFlow.newContract(address, source, "PayingBackContract")
        )
    }, 1000);
});
