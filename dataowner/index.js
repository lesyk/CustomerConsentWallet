"use strict";

const Web3 = require('web3');
const ConsentLib = require('consentlib');

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://node0:8545'));

let whisper = new ConsentLib.Whisper(web3);
let consentFlow = new ConsentLib.ConsentFlow(web3, whisper, null);

let email = process.argv[2];
let passphrase = process.argv[3];
let identity = whisper.newIdentity();
let address = process.argv[4];
let ttl = 100;
let priority = 100;

web3.personal.unlockAccount(address, passphrase);
web3.eth.defaultAccount = address;

consentFlow.discoverIdentityService((err, result, idServiceAddress) => {
    setTimeout(() => consentFlow.registerWhisperId(identity, idServiceAddress, email, ttl, priority), 200);
});

consentFlow.respondEthAddress(identity, email, address, ttl, priority);

setTimeout(() => consentFlow.dataRequested().then((result) => consentFlow.provideData(result.args.customer, result.args.data_requester, result.args.id.toString(10), "http://node0/data1.xml")), 1000);
