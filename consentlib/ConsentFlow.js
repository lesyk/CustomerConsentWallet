"use strict";

const axios = require('axios');

class ConsentFlow {
    constructor(web3, whisper) {
        this.web3 = web3;
        this.whisper = whisper;
        this.idServiceAddress = null;
        this.gasPrice = 50000000000;
        this.gas = 4000000;
        this.contractAddress = '0x5E147E352fdE327ADDda8616fda402B45Ad8A3F4';
        this.contractAbi = [{
            "constant": false,
            "inputs": [
                {"name": "data_requester", "type": "address"},
                {"name": "data_owner", "type": "address"},
                {"name": "id", "type": "uint256"},
                {"name": "state", "type": "uint8"}
            ],
            "name": "updateConsent",
            "outputs": [{"name": "", "type": "bool"}],
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
                {"name": "customer", "type": "address"},
                {"name": "data_owner", "type": "address"},
                {"name": "id", "type": "uint256"}
            ],
            "name": "requestData",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [
                {"name": "customer", "type": "address"},
                {"name": "data_owner", "type": "address"},
                {"name": "id", "type": "uint256"}
            ],
            "name": "requestConsent",
            "outputs": [],
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
                {"name": "", "type": "uint256", "value": "0"}
            ],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [
                {"name": "customer", "type": "address"},
                {"name": "data_requester", "type": "address"},
                {"name": "id", "type": "uint256"},
                {"name": "payload", "type": "bytes"}
            ],
            "name": "provideData",
            "outputs": [],
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
                {"name": "id", "type": "uint256", "value": "0"},
                {"name": "data_requester", "type": "address", "value": "0x"},
                {"name": "customer", "type": "address", "value": "0x"},
                {"name": "data_owner", "type": "address", "value": "0x"},
                {"name": "state", "type": "uint8", "value": "0"}
            ],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{"name": "", "type": "uint256"}],
            "name": "id_mapping",
            "outputs": [{"name": "", "type": "uint256", "value": "0"}],
            "payable": false,
            "type": "function"
        }, {"inputs": [], "type": "constructor"}, {
            "anonymous": false,
            "inputs": [
                {"indexed": false, "name": "customer", "type": "address"},
                {"indexed": false, "name": "data_owner", "type": "address"},
                {"indexed": false, "name": "data_requester", "type": "address"},
                {"indexed": false, "name": "id", "type": "uint256"}
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
                {"indexed": false, "name": "id", "type": "uint256"}
            ],
            "name": "ConsentUpdated",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [
                {"indexed": false, "name": "customer", "type": "address"},
                {"indexed": false, "name": "data_owner", "type": "address"},
                {"indexed": false, "name": "data_requester", "type": "address"},
                {"indexed": false, "name": "id", "type": "uint256"}
            ],
            "name": "DataRequested",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [
                {"indexed": false, "name": "customer", "type": "address"},
                {"indexed": false, "name": "data_owner", "type": "address"},
                {"indexed": false, "name": "data_requester", "type": "address"},
                {"indexed": false, "name": "id", "type": "uint256"},
                {"indexed": false, "name": "payload", "type": "bytes"}
            ],
            "name": "DataProvided",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": false, "name": "x", "type": "address"}],
            "name": "PrintAddress",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": false, "name": "x", "type": "bytes"}],
            "name": "Printbytes",
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

        axios({
            method:'post',
            url:'http://localhost:3000/',
            headers: { 'Access-Control-Allow-Origin': '*' },
            params: {
                source: ``,
            }
        })
        .then(function (response) {
            console.log(response.data);
            let compiledContract = response.data;

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
        })
        .catch(function (error) {
            console.log(error);
            return "";
        });
    }

    newConsentId() {
        return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }

    requestConsent(customer, dataOwner, consentId) {
        let contract = this.web3.eth.contract(this.contractAbi).at(this.contractAddress);
        let hexCustomer = this.web3.toHex(customer);
        let hexDataOwner = this.web3.toHex(dataOwner);

        console.log("Requesting consent", hexCustomer, hexDataOwner, consentId);

        let promise = new Promise((resolve, reject) => {
            contract.requestConsent(hexCustomer, hexDataOwner, consentId, {
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

        console.log("Listening for consent response", consentId);

        let promise = new Promise((resolve, reject) => {
            contract.ConsentUpdated((error, result) => {
                if (error) {
                    console.log("Failed to read consent response", error);
                    reject(Error(error));
                } else if (result && result.args.id.toString(10) == consentId) {
                    console.log("Consent given", result.args.id.toString(10));
                    resolve(result);
                } else {
                    console.log("Irrelevant consent response", result.args.id.toString(10));
                    console.log(result);
                }
            });
        });

        return promise;
    }

    requestData(customer, dataOwner, consentId) {
        let contract = this.getConsentContract();
        let hexCustomer = this.web3.toHex(customer);
        let hexDataOwner = this.web3.toHex(dataOwner);

        console.log("Requesting data", hexCustomer, hexDataOwner, consentId);

        let promise = new Promise((resolve, reject) => {
            contract.requestData(hexCustomer, hexDataOwner, consentId, {
                gas: this.gas,
                gasPrice: this.gasPrice
            }, (error, result) => {
                if (error) {
                    console.log("Failed to request data", error);
                    reject(Error(error));
                } else {
                    console.log("Data requested at transaction", result);
                    resolve(result);
                }
            });
        });

        return promise;
    }

    provideData(customer, dataRequester, consentId, payload) {
        let contract = this.getConsentContract();
        let hexCustomer = this.web3.toHex(customer);
        let hexDataRequester = this.web3.toHex(dataRequester);
        let hexPayload = this.web3.fromAscii(payload);

        console.log("Providing data", consentId, payload);

        let promise = new Promise((resolve, reject) => {
            contract.provideData(hexCustomer, hexDataRequester, consentId, hexPayload, {
                gas: this.gas,
                gasPrice: this.gasPrice
            }, (error, result) => {
                if (error) {
                    console.log("Failed to provide data", error);
                    reject(Error(error));
                } else {
                    console.log("Data provided at transaction", result);
                    resolve(result);
                }
            });
        });

        return promise;
    }

    dataRequested() {
        let contract = this.getConsentContract();
        console.log("Listening for data request");

        let promise = new Promise((resolve, reject) => {
            contract.DataRequested((error, result) => {
                if (error) {
                    console.log("Failed to read data request", error);
                    reject(Error(error));
                } else {
                    console.log("Data request received", result.args.id.toString(10));
                    resolve(result);
                }
            });
        });

        return promise;
    }

    dataProvided(consentId) {
        let contract = this.getConsentContract();

        console.log("Listening for data", consentId);

        let promise = new Promise((resolve, reject) => {
            contract.DataProvided((error, result) => {
                if (error) {
                    console.log("Failed read data provided", error);
                    reject(Error(error));
                } else if (result && result.args.id.toString(10) == consentId) {
                    console.log("Data provided", this.web3.toAscii(result.args.payload));
                    resolve(this.web3.toAscii(result.args.payload));
                } else {
                    console.log("Irrelevant data provided", result.args.id.toString(10));
                }
            });
        });

        return promise;
    }
}

module.exports = ConsentFlow;
