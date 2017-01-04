"use strict";

class Whisper {

    constructor(web3) {
        this.web3 = web3;
    }

    newIdentity() {
        return this.web3.shh.newIdentity();
    }

    payloadParsingCallback(err, result, callback) {
        if (err) {
            console.log("Failed to read Whisper message", err);
            callback(err, null, null);
        } else {
            try {
                callback(null, result, JSON.parse(this.web3.toAscii(result.payload)));
            } catch (err) {
                console.log("Failed to read Whisper message payload", err);
                callback(err, result, null);
            }
        }
    }

    send(from, to, topic, payload, ttl, priority) {

        let json = JSON.stringify(payload);

        let message = {
            from: from,
            to: to,
            topics: [this.web3.fromAscii(topic)],
            payload: this.web3.fromAscii(json),
            ttl: ttl,
            priority: priority
        };

        this.web3.shh.post(message, (err, result) => {
            if (err) {
                console.log("Failed to post Whisper message", message, payload, err);
            }
        });
    }

    filter(from, to, topic) {

        let filter = this.web3.shh.filter({
            to: to,
            from: from,
            topics: [this.web3.fromAscii(topic)]
        });

        return filter;
    }

    watch(filter, callback) {
        return filter.watch((err, result) => {
            this.payloadParsingCallback(err, result, callback);
        });
    }

    getMessages(filter, callback) {
        return filter.get((err, result) => {
            this.payloadParsingCallback(err, result, callback);
        });
    }

    stopWatching(filter) {
        return filter.stopWatching();
    }
}

module.exports = Whisper;
