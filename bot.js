const dotenv = require("dotenv");
dotenv.config();
var Web3 = require('web3');
const web3 = new Web3(process.env.BOT_ALCHEMY_KEY);

let latestKnownBlockNumber = -1;
let blockTime = 5000;

// Our function that will triggered for every block
async function processBlock(blockNumber) {
    console.log("We process block: " + blockNumber);
    let block = await web3.eth.getBlock(blockNumber);
    console.log("new block :", block)
    for (const transactionHash of block.transactions) {
        let transaction = await web3.eth.getTransaction(transactionHash);
        let transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
        transaction = Object.assign(transaction, transactionReceipt);
        console.log("Transaction: ", transaction);
        // Do whatever you want here
    }
    latestKnownBlockNumber = blockNumber;
}

// This function is called every blockTime, check the current block number and order the processing of the new block(s)
async function checkCurrentBlock() {
    const currentBlockNumber = await web3.eth.getBlockNumber()
    console.log("Current blockchain top: " + currentBlockNumber, " | Script is at: " + latestKnownBlockNumber);
    while (latestKnownBlockNumber == -1 || currentBlockNumber > latestKnownBlockNumber) {
        await processBlock(latestKnownBlockNumber == -1 ? currentBlockNumber : latestKnownBlockNumber + 1);
    }
    setTimeout(checkCurrentBlock, blockTime);
}

// checkCurrentBlock()

// console.log(web3.utils.toAscii("0x4d61726b65745061792e696f206973206465706c6f79696e6720536d61727420"));
// const x = '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
// const y = '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200200000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001000000000040000000'
// const z = '0x0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000de29df'
// console.log(web3.utils.toAscii(z));


// try to parse a specific transaction
async function test() {
    const transactionHash = '0xafd279fa65f1cc820268f369a097aa76707b168b98fe715bf3174be6f2f5759b';
    let transaction = await web3.eth.getTransaction(transactionHash);
    let transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
    transaction = Object.assign(transaction, transactionReceipt);
    console.log("Transaction: ", transaction);
}




// https://ethereumdev.io/listening-to-new-transactions-happening-on-the-blockchain/
// hash 32 Bytes – String: Hash of the transaction.
// nonce – Number: The number of transactions made by the sender prior to this one.
// blockHash 32 Bytes – String: Hash of the block where this transaction was in. null when its pending.
// blockNumber – Number: Block number where this transaction was in. null when its pending.
// transactionIndex – Number: Integer of the transactions index position in the block. null when its pending.
// from – String: Address of the sender.
// to – String: Address of the receiver. null when its a contract creation transaction.
// value – String: Value transferred in wei.
// gasPrice – String: Gas price provided by the sender in wei.
// gas – Number: Gas provided by the sender.
// input – String: The data sent along with the transaction.
// Example
// status – Boolean: TRUE if the transaction was successful, FALSE, if the EVM reverted the transaction.
// contractAddress – String: The contract address created, if the transaction was a contract creation, otherwise null.
// cumulativeGasUsed – Number: The total amount of gas used when this transaction was executed in the block.
// gasUsed– Number: The amount of gas used by this specific transaction alone.
// logs – Array: Array of log objects, which this transaction generated.

// get contract abi
const url = "https://api.etherscan.io/api?module=contract&action=getabi&address=0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d&apikey="+process.env.BOT_ETHERSCAN_KEY;
const fetch = require("node-fetch");
const InputDataDecoder = require('ethereum-input-data-decoder');

async function test() {    
    const json = await fetch(url)
    .then(response => response.json())
    .catch((e) => {});
    const abi = json['result'];
    console.log(abi);
    const decoder = new InputDataDecoder(abi);
    const data = "0xa723533e0000000000000000000000000000000000000000000000000000000000000002";
    const result = decoder.decodeData(data);
    console.log(result);
}

test()


// ethers.js / web3.js get transaction (alchemy api) -> parse get contract address (to)
// -> (etherscan api) abi -> parse input function name
// References
// get contract source code
// https://api.etherscan.io/api?module=contract&action=getsourcecode&address=0x6b175474e89094c44da98b954eedeac495271d0f
// const x = '0xa723533e0000000000000000000000000000000000000000000000000000000000000002';
// const x = '0xa723533e0000000000000000000000000000000000000000000000000000000000000002';
// console.log(web3.utils.toAscii(x));
// https://api.etherscan.io/api?module=contract&action=getabi&address=0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413
// https://api.etherscan.io/apis