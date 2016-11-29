contract mortal {
    address owner;

    function mortal() { owner = msg.sender; }

    function kill() { if (msg.sender == owner) selfdestruct(owner); }
}

contract greeter is mortal {
    string greeting;

    event SendGreeting(address to, address owner, string greeting);

    function greet(address to, string greeting) returns (string) {
      SendGreeting(to, msg.sender, greeting);
      return greeting;
    }
}
