pragma solidity ^0.4.6;

contract Consents {
    address owner;

    // mappings between id/customer addresses and consent array indexes, public accessible on key
    mapping (bytes16 => uint) public id_mapping;
    mapping (address => uint[]) public customer_mapping;

    // array of all consents, public accessible on index
    Consent[] public consents;

    enum State {Requested, Given, Revoked, Rejected}

    struct Consent {
        bytes16 id; // id is assumed to be a UUID
        address data_requester;
        address customer;
        address data_owner;
        State state;
    }

    event ConsentGiven (bool given, address customer, address data_owner, address data_requester, bytes16 id);
    event ConsentRevoked (address customer, address data_owner, address data_requester, bytes16 id);
    event ConsentRequested (address customer, address data_owner, address data_requester, bytes16 id);

    // used for debugging
    event PrintAddress(address x);
    event PrintString(string x);

    function Consents() payable {
        owner = msg.sender;
    }

    function requestConsent(address customer, address data_owner, bytes16 id) {
        var c = Consent(id, msg.sender, customer, data_owner, State.Requested);
        uint length = consents.push(c);
        uint index = length - 1;
        id_mapping[id] = index;
        customer_mapping[customer].push(index);
        ConsentRequested(customer, data_owner, msg.sender, id);
    }

    function giveConsent(address data_requester, address data_owner, bytes16 id) returns (bool) {
        var given = changeConsent(msg.sender, data_owner, data_requester, id, State.Given);
        ConsentGiven(given, msg.sender, data_owner, data_requester, id);
        return given;
    }

    function revokeConsent(address data_requester, address data_owner, bytes16 id) returns (bool) {
        if(changeConsent(msg.sender, data_owner, data_requester, id, State.Revoked)) {
            ConsentRevoked(msg.sender, data_owner, data_requester, id);
            return true;
        }
        return false;
    }

    function getConsent(uint index) constant returns (address, address, address, State, bytes16) {
        return (consents[index].data_requester, consents[index].customer, consents[index].data_owner, consents[index].state, consents[index].id);
    }

    function customerConsents(address customer) constant returns (uint) {
        return customer_mapping[customer].length;
    }

    function changeConsent(address customer, address data_owner, address data_requester, bytes16 id, State newState) private returns (bool) {
        var index = id_mapping[id];
        Consent consent = consents[index];

        if (consent.customer == customer &&
            consent.data_owner == data_owner &&
            consent.data_requester == data_requester &&
            consent.state != newState) {
                consent.state = newState;
                return true;
            }

        return false;
    }

    function kill() {
        if (msg.sender == owner) {
            selfdestruct(owner);
        }
    }
}
