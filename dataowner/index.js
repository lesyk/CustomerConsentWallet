var Web3 = require('web3');
var Whisper = require('./Whisper.js');

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://node0:8545'));

var email = process.argv[2];
var whisper = new Whisper(web3);
var identity = whisper.newIdentity();
var ttl = 100;
var priority = 100;

var register = web3.shh.filter({
    topics: [web3.fromAscii("identity-service-advertisement")]
}).watch(function (err, result) {
    if (err) {
        console.log("Failed to read Whisper message", err);
    } else {
        console.log("Identity Service advertisement received", err);
        whisper.send(identity, result.from, "identity-service-register", {"email": email}, ttl, priority);
    }
});
