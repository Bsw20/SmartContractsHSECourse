const Web3 = require('web3')
var web3 = new Web3(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/0bb0c8574ecc4f1285ee96324e9d8d49"));
const address = "0xf28d48a360197f30446154D078C0C53C322dA2ce";
const ABI = [
    {
        "inputs": [
            {
                "internalType": "int256",
                "name": "a",
                "type": "int256"
            },
            {
                "internalType": "int256",
                "name": "b",
                "type": "int256"
            }
        ],
        "name": "add",
        "outputs": [
            {
                "internalType": "int256",
                "name": "",
                "type": "int256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    }
];
web3.eth.getBalance // проверяем
const myContract = new web3.eth.Contract(ABI, address)
myContract.methods.add(10, 7).call().then(console.log)

// RESULT
// > myContract.methods.add(10, 7).call().then(console.log)
// Promise {
//   <pending>,
//   [Symbol(async_id_symbol)]: 131,
//   [Symbol(trigger_async_id_symbol)]: 122,
//   [Symbol(destroyed)]: { destroyed: false }
// }
// > 17