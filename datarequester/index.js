"use strict";

let Web3 = require('web3');
let ConsentLib = require('consentlib');

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://node0:8545'));

let email = process.argv[2];

let whisper = new ConsentLib.Whisper(web3);
let consentFlow = new ConsentLib.ConsentFlow(whisper);

let whisperIds = new Map();
let identity = whisper.newIdentity();
let ttl = 100;
let priority = 100;

consentFlow.discoverIdentityService((err, result, idServiceAddress) => {

    setTimeout(() => consentFlow.registerWhisperId(identity, idServiceAddress, email, ttl, priority), 200);

    setTimeout(() => {
        consentFlow.lookupWhisperIds(identity, idServiceAddress, [
            "umbrella-corp@example.com",
            "goliath-national-bank@example.com"
        ], ttl, priority, 9000).then((result) => whisperIds = result)
    }, 1000);
});
