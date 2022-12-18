const { expect } = require("chai")
const { ethers } = require("hardhat")

// https://www.youtube.com/watch?v=oHU3eme6l40 - код взят отсюда

// чтобы тестировать смарт контракт, изначально его нужно развернуть в блокчейне 
// можно в разные отправлять, но мы пока будет отправлять во временный блокчейн локальный, который существует, пока у нас есть тесты
// ТО ЕСТЬ КАК ТОЛЬКО ТЕСТЫ ОТРАБОТАЮТ, СМАРТ КОНТРАКТ БУДЕТ ПОТЕРЯН

// Нужно писать отдельный тест для каждой фичи, не должно быть такого, что один тест тестирует сразу все
// Каждый отдельный тест занимается своей небольшой частью
describe("Payments", function() { 
    let acc1 // например владелец
    let acc2 // например клиент, который шлет деньги
    let payments

    this.beforeEach(async function() { // ЭТОТ БЛОК БУДЕТ РАЗВОРАЧИВАТЬСЯ ПЕРЕД КАЖДЫМ ТЕСТОМ(1 тест - это 1 IT ), то есть перед каждым тестом будем получать свежий контракт. 
        // Что хорошо, т.к. тесты должны быть изолированы и не должны зависеть один от другого 
        [acc1, acc2] = await ethers.getSigners() // получить тестовые аккаунты, синтаксис значит, что мы берем первые два(а их там около 20)
        const Payments = await ethers.getContractFactory("Payments", acc1)  // название смарт контракта. По идее в этой функции мы скомпилированную верисю контракта

        payments = await Payments.deploy() // деплоим контракт и сохраняем объект, через который будем с ним взаимодействовать. Тут мы ждем, когда транзакция будет отправлена
        await payments.deployed() // тут ждем, когда деплой будет выполнен. То есть по завершению этой строки мы знаем, что контракт развернут
        // console.log(payments.address) // адрес, по которому контракт развернут
    })

    it("should be deployed ", async function() { // По идее так начинается тест
        // Через Waffle проверяем, что адрес контракта правильный(по идее так мы еще раз проверяем, что контракт развернут)
        expect(payments.address).to.be.properAddress
        console.log("success ")
    })

    it("should have 0 ether by default", async function() {
        const balance = await payments.currentBalance()
        expect(balance).to.eq(0)
        // console.log(balance)
    })

    it("should be possible to send funds", async function() {
        // Если не указать аккаунт, то по умолчанию средства будут отправлены из самого первого аккаунта, который получил доступ к блокчейну
        // Чтобы от какого-то конкретного аккаунта была выполнена транзация - нужно указать connect

        const sum = 100 // 100 wei
        const tx = await payments.connect(acc2).pay("Hello from hardhat", {value: sum}) // 100 wei
        const msg = "Hello from hardhat"

        await expect(() => tx)
            .to.changeEtherBalances([acc2, payments], [-100, 100 ])

        await tx.wait()

        const newPayment = await payments.getPayment(acc2.address, 0 )
        console.log(newPayment)
        expect(newPayment.message).to.eq(msg)
        expect(newPayment.amount).to.eq(sum)
        expect(newPayment.from).to.eq(acc2.address)


        //
        // const balance = await payments.currentBalance()
        // console.log(balance)
    })
})