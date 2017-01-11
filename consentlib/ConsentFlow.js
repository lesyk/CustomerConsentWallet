"use strict";

class ConsentFlow {

    constructor(web3, whisper, solc) {
        this.web3 = web3;
        this.whisper = whisper;
        this.solc = solc;
        this.idServiceAddress = null;
        this.gasPrice = 50000000000;
        this.gas = 500000;
        this.contractAddress = '0x93F231fBeFE32D54A38690ddaA425222Cab7e957';
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
                {"name": "id", "type": "bytes16"}
            ],
            "name": "giveConsent",
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
            "outputs": [{
                "name": "",
                "type": "address",
                "value": "0x20f33d4743731db02b52f1de7fb762ef3fc471e3"
            }, {"name": "", "type": "address", "value": "0x129d0c1d983262dcee658cacae1db7682330905a"}, {
                "name": "",
                "type": "address",
                "value": "0x129d0c1d983262dcee658cacae1db7682330905a"
            }, {"name": "", "type": "uint8", "value": "0"}, {
                "name": "",
                "type": "bytes16",
                "value": "0x12300000000000000000000000000000"
            }],
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
            "constant": false,
            "inputs": [
                {"name": "data_requester", "type": "address"},
                {"name": "data_owner", "type": "address"},
                {"name": "id", "type": "bytes16"}
            ],
            "name": "revokeConsent",
            "outputs": [{"name": "", "type": "bool"}],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{"name": "", "type": "uint256"}],
            "name": "consents",
            "outputs": [{
                "name": "id",
                "type": "bytes16",
                "value": "0x12300000000000000000000000000000"
            }, {
                "name": "data_requester",
                "type": "address",
                "value": "0x0000000000000000000000000000000020f33d47"
            }, {
                "name": "customer",
                "type": "address",
                "value": "0x3fc471e3000000000000000000000000129d0c1d"
            }, {
                "name": "data_owner",
                "type": "address",
                "value": "0x2330905a000000000000000000000000129d0c1d"
            }, {
                "name": "state",
                "type": "uint8",
                "value": "6.8840577665331762960062340143144211974827539722152103940360052033988904091648e+76"
            }],
            "payable": false,
            "type": "function"
        }, {"inputs": [], "payable": false, "type": "constructor"}, {
            "anonymous": false,
            "inputs": [{"indexed": false, "name": "given", "type": "bool"}, {
                "indexed": false,
                "name": "customer",
                "type": "address"
            }, {"indexed": false, "name": "data_owner", "type": "address"}, {
                "indexed": false,
                "name": "data_requester",
                "type": "address"
            }, {"indexed": false, "name": "id", "type": "bytes16"}],
            "name": "ConsentGiven",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": false, "name": "customer", "type": "address"}, {
                "indexed": false,
                "name": "data_owner",
                "type": "address"
            }, {"indexed": false, "name": "data_requester", "type": "address"}, {
                "indexed": false,
                "name": "id",
                "type": "bytes16"
            }],
            "name": "ConsentRevoked",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": false, "name": "customer", "type": "address"}, {
                "indexed": false,
                "name": "data_owner",
                "type": "address"
            }, {"indexed": false, "name": "data_requester", "type": "address"}, {
                "indexed": false,
                "name": "id",
                "type": "bytes16"
            }],
            "name": "ConsentRequested",
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

    requestConsent(customer, dataOwner) {

        let contract = this.web3.eth.contract(this.contractAbi).at(this.contractAddress);
        let consentId = Math.floor(Math.random() * 10000);
        let hexCustomer =  this.web3.toHex(customer);
        let hexDataOwner =  this.web3.toHex(dataOwner);
        let hexConsentId =  this.web3.toHex(consentId);

        console.log("Requesting consent customer", hexCustomer, "data owner", hexDataOwner, "consent id", hexConsentId);

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
}

module.exports = ConsentFlow;
