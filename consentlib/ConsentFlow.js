"use strict";

class ConsentFlow {

    constructor(web3, whisper, solc) {
        this.web3 = web3;
        this.whisper = whisper;
        this.solc = solc;
        this.idServiceAddress = null;
        this.gasPrice = 50000000000;
        this.gas = 500000;
        this.contractAddress = '0x700355626605434510B7396e6DB3e752aC78739f';
        this.contractAbi = [{
            "constant": false,
            "inputs": [
                {"name": "customer", "type": "address"},
                {"name": "data_owner", "type": "address"},
                {"name": "id", "type": "bytes16"}
            ],
            "name": "requestConsent",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{"name": "", "type": "bytes16"}],
            "name": "id_mapping",
            "outputs": [{"name": "", "type": "uint256", "value": "0"}],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "kill",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [
                {"name": "data_requester", "type": "address"},
                {"name": "data_owner", "type": "address"},
                {"name": "id", "type": "bytes16"},
                {"name": "state", "type": "uint8"}
            ],
            "name": "updateConsent",
            "outputs": [{"name": "", "type": "bool"}],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [
                {"name": "", "type": "address"},
                {"name": "", "type": "uint256"}
            ],
            "name": "customer_mapping",
            "outputs": [{"name": "", "type": "uint256", "value": "0"}],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{"name": "index", "type": "uint256"}],
            "name": "getConsent",
            "outputs": [
                {"name": "", "type": "address", "value": "0x"},
                {"name": "", "type": "address", "value": "0x"},
                {"name": "", "type": "address", "value": "0x"},
                {"name": "", "type": "uint8", "value": "0"},
                {"name": "", "type": "bytes16", "value": "0x"}
            ],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{"name": "customer", "type": "address"}],
            "name": "customerConsents",
            "outputs": [{"name": "", "type": "uint256", "value": "0"}],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{"name": "", "type": "uint256"}],
            "name": "consents",
            "outputs": [
                {"name": "id", "type": "bytes16", "value": "0x"},
                {"name": "data_requester", "type": "address", "value": "0x"},
                {"name": "customer", "type": "address", "value": "0x"},
                {"name": "data_owner", "type": "address", "value": "0x"},
                {"name": "state", "type": "uint8", "value": "0"}
            ],
            "payable": false,
            "type": "function"
        }, {"inputs": [], "payable": true, "type": "constructor"}, {
            "anonymous": false,
            "inputs": [
                {"indexed": false, "name": "customer", "type": "address"},
                {"indexed": false, "name": "data_owner", "type": "address"},
                {"indexed": false, "name": "data_requester", "type": "address"},
                {"indexed": false, "name": "id", "type": "bytes16"}
            ],
            "name": "ConsentRequested",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [
                {"indexed": false, "name": "updated", "type": "bool"},
                {"indexed": false, "name": "customer", "type": "address"},
                {"indexed": false, "name": "data_owner", "type": "address"},
                {"indexed": false, "name": "data_requester", "type": "address"},
                {"indexed": false, "name": "state", "type": "uint8"},
                {"indexed": false, "name": "id", "type": "bytes16"}
            ],
            "name": "ConsentUpdated",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": false, "name": "x", "type": "address"}],
            "name": "PrintAddress",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": false, "name": "x", "type": "string"}],
            "name": "PrintString",
            "type": "event"
        }];
    }

    getConsentContract() {
        return this.web3.eth.contract(this.contractAbi).at(this.contractAddress);
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
        let address = this.web3.personal.newAccount(passphrase);
        console.log("Created new address", address);
        return address;
    }

    newContract(address, source, contractName) {

        console.log("Deploying contract", contractName);

        let compiledContract = this.solc.compile(source, 1);
        let abi = compiledContract.contracts[contractName].interface;

        console.log('Abi', abi);

        let contract = this.web3.eth.contract(JSON.parse(abi));
        let bytecode = compiledContract.contracts[contractName].bytecode;
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

    newConsentId() {
        return Math.floor(Math.random() * 10000);
    }

    requestConsent(customer, dataOwner, consentId) {

        let contract = this.web3.eth.contract(this.contractAbi).at(this.contractAddress);
        let hexCustomer = this.web3.toHex(customer);
        let hexDataOwner = this.web3.toHex(dataOwner);
        let hexConsentId = this.web3.toHex(consentId);

        console.log("Requesting consent", hexCustomer, hexDataOwner, hexConsentId);

        let promise = new Promise((resolve, reject) => {
            contract.requestConsent(hexCustomer, hexConsentId, consentId, {
                gas: this.gas,
                gasPrice: this.gasPrice
            }, (error, result) => {
                if (error) {
                    console.log("Failed to request a consent", error);
                    reject(Error(error));
                } else {
                    console.log("Consent requested at transaction", result);
                    resolve(result);
                }
            });
        });

        return promise;
    }

    consentGiven(consentId) {

        let contract = this.getConsentContract();
        let hexMask = 0x10000000000000000000000000000000;
        let hexConsentId = "0x" + (this.web3.toHex(consentId) * hexMask).toString(16).substring(0, 32);

        console.log("Listening for consent response", hexConsentId);

        let promise = new Promise((resolve, reject) => {
            contract.ConsentUpdated((error, result) => {
                if (error) {
                    console.log("Failed to read consent response", error);
                    reject(Error(error));
                } else if (result && result.args.id == hexConsentId) {
                    console.log("Consent given", result.args.id);
                    resolve(result);
                } else {
                    console.log("Irrelevant response", result.args.id);
                }
            });
        });

        return promise;
    }
}

module.exports = ConsentFlow;
