"use strict";

const Web3 = require('web3');
const solc = require('solc')
const ConsentLib = require('consentlib');
const fs = require("fs");

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

let email = process.argv[2];
let whisper = new ConsentLib.Whisper(web3);
let consentFlow = new ConsentLib.ConsentFlow(whisper);
let identity = whisper.newIdentity();
let ttl = 100;
let priority = 100;

consentFlow.discoverIdentityService((err, result, idServiceAddress) => {
    setTimeout(() => consentFlow.registerWhisperId(identity, idServiceAddress, email, ttl, priority), 200);
});

let account = web3.personal.unlockAccount(web3.eth.accounts[0], 'password');
let source = fs.readFileSync('./../contracts/PayingBackContract.sol', 'utf8');
let compiledContract = solc.compile(source, 1);
let abi = compiledContract.contracts['PayingBackContract'].interface;
console.log('Abi: ', abi);
let bytecode = compiledContract.contracts['PayingBackContract'].bytecode;
let gasEstimate = web3.eth.estimateGas({data: bytecode});
let contract = web3.eth.contract(JSON.parse(abi));
contract.new({from:web3.eth.accounts[0], data:bytecode, value:30000000000000000000, gas:gasEstimate}, function(err, myContract){
  if(!err) {
     if(!myContract.address) {
         console.log("Hash: ", myContract.transactionHash);
     } else {
         console.log("Address: ", myContract.address);
     }
  }
  else {
    console.log(err);
  }
});
