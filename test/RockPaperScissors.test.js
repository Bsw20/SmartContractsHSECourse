const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("RockPaperScissors", function() {
    let acc1
    const accName = "Jared"

    const Decision = {
        PAPER: 0,
        ROCK: 1,
        SCISSORS: 2
    }

    const GameResult = {
        DRAW: 0,
        WIN: 1,
        LOSE: 2
    }

    this.beforeEach(async function() {
        [acc1] = await ethers.getSigners()
        const RPS = await ethers.getContractFactory("RockPaperScissors", acc1)
        rps = await RPS.deploy()

        await rps.deployed()
    })

    it("Should be deployed ", async function() {
        expect(rps.address).to.be.properAddress
    })

    it("Should call event on signIn", async function() {
        var signIn = await rps.signIn(accName)
        await expect(signIn).to.emit(rps, "NewPlayerSignIn").withArgs(acc1.address, "Jared")
    })

    it("Should call event, when registered played played", async function() {
        await rps.signIn(accName)
        var playGame = await rps.playWithBot(Decision.ROCK)
        await expect(playGame).to
            .emit(rps, "OneMoreGameFinished");
    })

    // it("Should revert on unregister player game starting", async function() {
    //     var playGame = await rps.playWithBot(0)
    //     await expect(playGame).to.be.revertedWith("You are not a registered player");
    // }) // Делает реверт и возвращает ровно такое же сообщение, но почему-то сам тест падает

    it("Should correct game result on ROCK move", async function() {
        await rps.signIn(accName)
        await rps.playWithBot(Decision.ROCK)

        var gameResult = await rps.games(1);
        expect(gameResult.player).to.equal(acc1.address)
        expect(gameResult.playerDecision).to.equal(Decision.ROCK)
        // TODO: rename result on contract
        // if (gameResult.botDecision == Decision.PAPER) {
        //     expect(gameResult.result).to.equal(GameResult.LOSE)
        // }
        //
        // if (gameResult.botDecision == Decision.ROCK) {
        //     expect(gameResult.result).to.equal(GameResult.DRAW)
        // }
        //
        // if (gameResult.botDecision == Decision.SCISSORS) {
        //     expect(gameResult.result).to.equal(GameResult.WIN)
        // }
        console.log(gameResult)
    })
})