"use strict";

class ConsentFlow {

    constructor(web3, whisper, solc) {
        this.web3 = web3;
        this.whisper = whisper;
        this.solc = solc;
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
    }

    lookupEthAddresses(self, whisperIds, ttl, priority, timeout) {

        let promise = new Promise((resolve, reject) => {

            let ethAddresses = new Map();
            let addressLookupFilter = this.whisper.filter(null, self, "eth-address-lookup");

            this.whisper.watch(addressLookupFilter, (err, result, payload) => {
                if (payload && payload.email && payload.eth) {
                    ethAddresses.set(payload.email, payload.eth);
                    console.log("Discovered address", payload.email, payload.eth);
                } else if (err) {
                    reject(Error(err));
                }
            });

            console.log("Whisper ids", whisperIds);

            whisperIds.forEach((id, email) => {
                console.log("Lookup address for", email, id);
                this.whisper.send(self, id, "eth-address-lookup", {"email": email}, ttl, priority);
            });

            setTimeout(() => {
                this.whisper.stopWatching(addressLookupFilter);
                console.log("Discovered addresses", ethAddresses);
                resolve(ethAddresses);
            }, timeout);
        });

        return promise;
    }

    respondEthAddress(self, email, address, ttl, priority) {

        let addressLookupFilter = this.whisper.filter(null, self, "eth-address-lookup");

        this.whisper.watch(addressLookupFilter, (err, result, payload) => {
            if (payload && payload.email && payload.email == email) {
                console.log("Responding address request", email, address);
                this.whisper.send(self, result.from, "eth-address-lookup", {
                    "email": email,
                    "eth": address
                }, ttl, priority);
            } else if (err) {
                console.log("Failed to respond address request", err);
            }
        });

        return addressLookupFilter;
    }

    newEthAddress(passphrase) {
        return this.web3.personal.newAccount(passphrase);
    }

    newContract(address, source, contractName) {

        let compiledContract = this.solc.compile(source, 1);
        let abi = compiledContract.contracts[contractName].interface;

        console.log('Abi', abi);

        let contract = this.web3.eth.contract(JSON.parse(abi));
        let bytecode = compiledContract.contracts['PayingBackContract'].bytecode;
        let gasEstimate = this.web3.eth.estimateGas({data: bytecode});

        let newContract = contract.new({
            from: address,
            data: bytecode,
            value: 30000000000000000000,
            gas: gasEstimate
        }, (err, myContract) => {
            if (!err) {
                if (!myContract.address) {
                    console.log("Hash: ", myContract.transactionHash);
                } else {
                    console.log("Address: ", myContract.address);
                }
            }
            else {
                console.log(err);
            }
        });

        return newContract;
    }
}

module.exports = ConsentFlow;
