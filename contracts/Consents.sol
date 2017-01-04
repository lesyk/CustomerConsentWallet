pragma solidity ^0.4.6;

contract Consents {
    mapping (address => Consent[]) public consents;

    enum State {Requested, Given, Revoked, Rejected}

    struct Consent {
        address customer;
        address data_owner;
        string id;
        State state;
    }

    event ConsentGiven (address customer, address data_owner, address data_requester, string id);
    event ConsentRevoked (address customer, address data_owner, address data_requester, string id);
    event ConsentRequested (address customer, address data_owner, address data_requester, string id);

    function Consents() {
    }

    function requestConsent(address customer, address data_owner, string id) {
        consents[msg.sender].push(Consent(customer, data_owner, id, State.Requested));
        ConsentRequested(customer, data_owner, msg.sender, id);
    }

    function giveConsent(address data_requester, address data_owner, string id) returns (bool) {
        if(changeConsent(msg.sender, data_owner, data_requester, id, State.Given)) {
            ConsentGiven(msg.sender, data_owner, data_requester, id);
            return true;
        }
        return false;
    }

    function revokeConsent(address data_requester, address data_owner, string id) returns (bool) {
        if(changeConsent(msg.sender, data_owner, data_requester, id, State.Revoked)) {
            ConsentRevoked(msg.sender, data_owner, data_requester, id);
            return true;
        }
        return false;
    }

    function changeConsent(address customer,
      address data_owner,
      address data_requester,
      string id,
      State newState)
      private
      returns (bool)
    {
        Consent[] cns = consents[data_requester];

        for (uint i; i < cns.length; i++) {
            Consent consent = cns[i];
            if (consent.customer == customer
                && consent.data_owner == data_owner
                && stringsEqual(consent.id, id)
                && consent.state != newState) {
                    consent.state = newState;
                    return true;
                }
        }

        return false;
    }

    function stringsEqual(string storage _a, string memory _b) internal returns (bool) {
        bytes storage a = bytes(_a);
        bytes memory b = bytes(_b);
        if (a.length != b.length)
            return false;
        // @todo unroll this loop
        for (uint i = 0; i < a.length; i ++)
            if (a[i] != b[i])
                return false;
        return true;
    }
}
