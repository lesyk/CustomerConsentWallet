"use strict";

class ConsentFlow {

    constructor(whisper) {
        this.whisper = whisper;
        this.idServiceAddress = null;
    }

    discoverIdentityService(callback) {
        this.whisper.watch(this.whisper.filter(null, null, "identity-service-advertisement"), (err, result, payload) => {
            if (!this.idServiceAddress || this.idServiceAddress != result.from) {
                this.idServiceAddress = result.from;
                console.log("Discovered Identity service at address", this.idServiceAddress);
                callback(err, result, this.idServiceAddress);
            } else {
                console.log("Identity service address unchanged", this.idServiceAddress);
            }
        });
    }

    registerWhisperId(from, to, email, ttl, priority) {
        console.log("Registering identity", email, from);
        this.whisper.send(from, to, "identity-service-register", {"email": email}, ttl, priority);
    }

    lookupWhisperIds(from, to, emails, ttl, priority, timeout) {

        let promise = new Promise((resolve, reject) => {

            let whisperIds = new Map();
            let idLookupFilter = this.whisper.filter(to, from, "identity-service-lookup");

            this.whisper.watch(idLookupFilter, (err, result, payload) => {
                if (payload && payload.email && payload.id) {
                    whisperIds.set(payload.email, payload.id);
                    console.log("Discovered identity", payload.email, payload.id);
                } else if (err) {
                    reject(Error(err));
                }
            });

            emails.forEach((email) => {
                console.log("Lookup identity for", email);
                this.whisper.send(from, to, "identity-service-lookup", {"email": email}, ttl, priority);
            });

            setTimeout(() => {
                this.whisper.stopWatching(idLookupFilter);
                console.log("Discovered identities", whisperIds);
                resolve(whisperIds);
            }, timeout);
        });

        return promise;
    };
}

module.exports = ConsentFlow;
