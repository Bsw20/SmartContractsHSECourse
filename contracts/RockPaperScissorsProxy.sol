// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;


contract RockPaperScissorsProxy {
    struct Player {
        string name;
        bool existsFlag; // для маппинга
    }

    event NewPlayerSignIn(address indexed playerAddress, string indexed name);

    // Variables
    mapping(address => Player) public players;
    address public owner;
    address gameContract;

    constructor (address _gameContract)  {
        gameContract = _gameContract;
    }

    function delegateCallSignIn(string memory name) public payable {

        (bool success, bytes memory data) = gameContract.delegatecall(
            abi.encodeWithSignature("signIn(string)", name)
        );

        require(success, "Error");
    }

    function callSignIn(string memory name) public payable {

        (bool success, bytes memory data) = gameContract.call(
            abi.encodeWithSignature("signIn(string)", name)
        );

        require(success, "Error");
    }


}