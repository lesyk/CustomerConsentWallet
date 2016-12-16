function Whisper(web3) {
    this.web3 = web3;
}

Whisper.prototype.newIdentity = function () {
    return this.web3.shh.newIdentity();
};

Whisper.prototype.echo = function (from, topic, result, ttl, priority) {

    var message = {
        from: from,
        to: result.from,
        topics: [this.web3.fromAscii(topic)],
        payload: result.payload,
        ttl: ttl,
        priority: priority
    };

    this.post(message);
};

Whisper.prototype.send = function (from, to, topic, payload, ttl, priority) {

    var json = JSON.stringify(payload);

    var message = {
        from: from,
        to: to,
        topics: [this.web3.fromAscii(topic)],
        payload: this.web3.fromAscii(json),
        ttl: ttl,
        priority: priority
    };

    this.post(message);
};

Whisper.prototype.post = function (message) {

    this.web3.shh.post(message, function (err, result) {
        if (err) {
            console.log("Failed to send Whisper message", message, err);
        }
    });
};

module.exports = Whisper;
