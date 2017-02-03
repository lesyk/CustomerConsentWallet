# CustomerConsentWallet

###Install & Run
1. `cd wallet`
2. `yarn install`
3. `bower install`
4. `ember s`

## Contracts

Contracts source code is located in _contracts/_

The _Consents_ contract is the one currently used. It can be used as a 'singleton' contract that contains state on all consents.
The following function can be called on the contract:
* `function requestConsent(address customer, address data_owner, uint id)` Called by the data requester. Assumes the consent id parameter is globally unique.
* `function updateConsent(address data_owner, address data_requester, uint id, State state) returns (bool)` Called by customer. State should be 1 or 3 for for given/rejected (currently not enforced).
* `function requestData(address customer, address data_owner, uint id)` Called by data requester.
* `function provideData(address customer, address data_requester, uint id, bytes payload)` Called by data owner.

All function calls generates an event (which can be used to check the return value of the function call).

Parties that call a contract function, must have enough ether to pay for the transaction.

Due to the global nature of the contract and to Solidity/Ethereum VM limitations, reading data from the contract is somewhat convoluted currently. A customer's contracts can be retrieved by:

* `function customerConsents(address customer)` returns the number of consents for the customer
* Look up in the public accessible `customer_mapping` with customer address and index (0 - number of consents) returns the indices (one for each lookup) in the public accessible `consents` array
* A consent can be retrieved from the `consents` array using an index

An example can be seen in _wallet/app/routes/consents.js_.

The contract can be removed by calling the `kill()` function, which can only be called by the account that deployed the contract.

https://ethereum.github.io/browser-solidity can be used to experiment with, develop and debug the contract.
