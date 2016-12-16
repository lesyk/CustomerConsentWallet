var Web3 = require('web3');
var Whisper = require('./Whisper.js');

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://node0:8545'));

var ids = new Map();

var whisper = new Whisper(web3);
var identity = whisper.newIdentity();
var broadcast = null;
var ttl = 100;
var priority = 100;
var topic = "identity-service-advertisement";
var payload = {
    topics: [
        {
            "topic": "identity-service-echo",
            "request": "String",
            "response": null,
        },
        {
            "topic": "identity-service-register",
            "request": {"email": "String"},
            "response": null,
        },
        {
            "topic": "identity-service-lookup",
            "request": {"email": "String"},
            "response": {"email": "String", "id": "String"}
        }
    ]
};

setInterval(() => whisper.send(identity, broadcast, topic, payload, ttl, priority), 10000);

var echo = web3.shh.filter({
    to: identity,
    topics: [web3.fromAscii("identity-service-echo")]
}).watch(function (err, result) {
    if (err) {
        console.log("Failed to read Whisper message", err);
    } else {
        whisper.echo(identity, "identity-service-echo", result, ttl, priority);
    }
});

var register = web3.shh.filter({
    to: identity,
    topics: [web3.fromAscii("identity-service-register")]
}).watch(function (err, result) {
    if (err) {
        console.log("Failed to read Whisper message", err);
    } else {
        try {
            var registerRequest = JSON.parse(web3.toAscii(result.payload));
            var email = registerRequest.email;
            var whisperId = result.from;

            ids.set(email, whisperId);
        } catch (err) {
            console.log("Failed to interpret Whisper message payload", web3.toAscii(result.payload), err);
        }
    }
});

var lookup = web3.shh.filter({
    to: identity,
    topics: [web3.fromAscii("identity-service-lookup")]
}).watch(function (err, result) {
    if (err) {
        console.log("Failed to read Whisper message", err);
    } else {
        var whisperId;
        var email;

        try {
            var lookupRequest = JSON.parse(web3.toAscii(result.payload));
            email = lookupRequest.email;
            whisperId = ids.get(email);
        } catch (err) {
            console.log("Failed to interpret Whisper message payload", web3.toAscii(result.payload), err);
        }

        if (whisperId && email) {
            whisper.send(identity, result.from, "identity-service-lookup", {
                "email": email,
                "id": whisperId
            }, ttl, priority);
        }
    }
});
