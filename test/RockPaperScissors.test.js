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

    it("Should correct call with proxy", async function() {

        const ProxyContract = await ethers.getContractFactory("RockPaperScissorsProxy")
        const proxyContract = await ProxyContract.deploy(rps.address)

        var callSignIn = proxyContract.callSignIn(accName)
        // Проверяем, что главном контракте был зарегистрирован пользователь с адресом контракта
        await expect(callSignIn).to.emit(rps, "NewPlayerSignIn").withArgs(proxyContract.address, accName)
        // Хардкодом проверяем, что адреса игрока сохранились правильно
        const pl1 = await rps.players(proxyContract.address)
        const pl2 = await rps.players(acc1.address)
        const pl3 = await proxyContract.players(proxyContract.address)
        const pl4 = await proxyContract.players(acc1.address)

        expect(pl1.existsFlag).to.equal(true)
        expect(pl2.existsFlag).to.equal(false)
        expect(pl3.existsFlag).to.equal(false)
        expect(pl4.existsFlag).to.equal(false)
        // console.log(pl1)
        // console.log(pl2)
        // console.log(pl3)
        // console.log(pl4)
    })

    it("Should correct delegateСall with proxy", async function() {

        const ProxyContract = await ethers.getContractFactory("RockPaperScissorsProxy")
        const proxyContract = await ProxyContract.deploy(rps.address)

        var callSignIn = proxyContract.delegateCallSignIn(accName)
        // Проверяем, что прокси контракте был зарегистрирован пользователь c адресом пользователя
        await expect(callSignIn).to.emit(proxyContract, "NewPlayerSignIn").withArgs(acc1.address, accName)
        // Хардкодом проверяем, что адреса игрока сохранились правильно
        const pl1 = await rps.players(proxyContract.address)
        const pl2 = await rps.players(acc1.address)
        const pl3 = await proxyContract.players(proxyContract.address)
        const pl4 = await proxyContract.players(acc1.address)

        expect(pl1.existsFlag).to.equal(false)
        expect(pl2.existsFlag).to.equal(false)
        expect(pl3.existsFlag).to.equal(false)
        expect(pl4.existsFlag).to.equal(true)
    })

    it("Should call event on signIn", async function() {
        var signIn = await rps.signIn(accName)
        await expect(signIn).to.emit(rps, "NewPlayerSignIn").withArgs(acc1.address, accName)
    })

    it("Should call event, when registered played played", async function() {
        await rps.signIn(accName)
        var playGame = await rps.playWithBot(Decision.ROCK)
        await expect(playGame).to
            .emit(rps, "OneMoreGameFinished");
    })

    it("Should revert on unregister player game starting", async function() {
        var playGame = await rps.playWithBot(0)
        await expect(playGame).to.be.revertedWith('You are not a registered player');
    }) // Делает реверт и возвращает РОВНО ТАКОЕ сообщение, но почему-то тест подсвечивает красным, долго гуглил, но не нашел, как этот баг обойти

    it("Should correct game result on ROCK move", async function() {
        await rps.signIn(accName)
        await rps.playWithBot(Decision.ROCK)

        var gameResult = await rps.games(1);
        expect(gameResult.player).to.equal(acc1.address)
        expect(gameResult.playerDecision).to.equal(Decision.ROCK)
        console.log(gameResult)
        // Когда подставлял значения из энама, почему-то криво работало
        if (gameResult.botDecision == Decision.PAPER) {
            expect(gameResult["result"]).to.equal(GameResult.LOSE)
        }

        if (gameResult.botDecision == Decision.ROCK) {
            expect(gameResult["result"]).to.equal(GameResult.DRAW)
        }

        if (gameResult.botDecision == Decision.SCISSORS) {
            expect(gameResult["result"]).to.equal(GameResult.WIN)
        }
        console.log(gameResult)
    })
})