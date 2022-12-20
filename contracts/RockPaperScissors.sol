// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

// Реализую игру с ботом, вроде бы ограничений нет на это в задании
// Схема commit-reveal нужна, чтобы не раскрывать до какого-то момента приватные данные, в этом случае удобнее без нее
// Т.к. нет ожидания запроса от другого аккаунта

contract RockPaperScissors {
    enum Decision {
        PAPER,
        ROCK,
        SCISSORS
    }

    enum GameResult {
        DRAW,
        WIN,
        LOSE
    }

    struct Game {
        address player;
        Decision playerDecision;
        Decision botDecision;
        GameResult result;
        bool existsFlag; // для маппинга

    }

    struct Player {
        string name;
        bool existsFlag; // для маппинга
    }

    // events
    event NewPlayerSignIn(address indexed playerAddress, string indexed name);
    event OneMoreGameFinished(address indexed playerAddress, bool isWinner, uint gameIndex);

    // Variables
    mapping(address => Player) public players;
    address public owner;
    mapping(uint => Game) public games;
    uint gamesCount;

    constructor() {
        owner = msg.sender;
    }

    // modifiers
    modifier onlyPlayers() {
        require(players[msg.sender].existsFlag, "You are not a registered player");
        _;
    }

    // functions
    function signIn(string memory name) public {
        require(bytes(name).length > 0, "Name can't be empty");
        require(players[msg.sender].existsFlag == false, "Player already exists");
        players[msg.sender] = Player(name, true);
        emit NewPlayerSignIn(msg.sender, name);
    }


    function playWithBot(Decision playerDecision) public onlyPlayers {
        Decision botDecision = getRandomBotDecision();
        GameResult gameResult = getGameResult(playerDecision, botDecision);

        gamesCount++;
        Game memory game = Game(msg.sender, playerDecision, botDecision, gameResult, true);
        games[gamesCount] = game;

        emit OneMoreGameFinished(msg.sender, gameResult == GameResult.WIN, gamesCount);
    }

    function getGame(uint64 id) public view returns (Game memory) {
        Game memory game = games[id];
        require(game.existsFlag, "Game not exists");
        return game;
    }

    // Получить псевдо-рандомное решение, которое можно сломать
    // Используется исключительно для учебных целей
    function getRandomBotDecision() private view returns (Decision) {
        // uint randomHash = uint(keccak256(block.difficulty, block.timestamp));
        // uint = randomHash % 3;
        uint randomNumber = (block.timestamp + block.difficulty) % 3;
        return Decision(randomNumber);
    }

    function getGameResult(Decision decision1, Decision decision2) private pure returns (GameResult)
    {
        if (decision1 == decision2) {
            return GameResult.DRAW;
        }

        if ((decision1 == Decision.PAPER && decision2 == Decision.ROCK) ||
        (decision1 == Decision.ROCK && decision2 == Decision.SCISSORS) ||
            (decision1 == Decision.SCISSORS && decision2 == Decision.PAPER)) {
            return GameResult.WIN;
        }

        return GameResult.LOSE;
    }
}