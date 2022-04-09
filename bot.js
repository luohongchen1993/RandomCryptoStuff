// NFT mint listener - related docs
// https://ethereumdev.io/listening-to-new-transactions-happening-on-the-blockchain/
// https://web3py.readthedocs.io/en/stable/examples.html#eth-getlogs-limitations
// https://cryptomarketpool.com/how-to-listen-for-ethereum-events-using-web3-in-python/
// https://cryptomarketpool.com/how-to-create-a-snipe-bot-to-monitor-liquidity-pairs-in-python/
// https://web3py.readthedocs.io/en/stable/examples.html#looking-up-blocks
// https://github.com/ethereum/web3.py/issues/1225
// https://web3js.readthedocs.io/en/v1.2.11/web3.html
// https://zhiyan.blog/2021/05/23/how-to-create-a-pancakeswap-bot-using-python/
// https://medium.com/pixelpoint/track-blockchain-transactions-like-a-boss-with-web3-js-c149045ca9bf

// Parsing:
// https://docs.ethers.io/v5/api/utils/abi/interface/#Interface--parsing
// https://web3js.readthedocs.io/en/v1.2.11/web3-utils.html
// https://ethereum.stackexchange.com/questions/31905/decode-etherscan-io-contract-input-data
// https://towardsdatascience.com/decoding-ethereum-smart-contract-data-eed513a65f76
// https://stackoverflow.com/questions/55258332/find-the-function-name-and-parameter-from-input-data
// https://docs.soliditylang.org/en/v0.8.7/abi-spec.html#formal-specification-of-the-encoding

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

// References
// get contract source code
// https://api.etherscan.io/api?module=contract&action=getsourcecode&address=0x6b175474e89094c44da98b954eedeac495271d0f
// https://api.etherscan.io/api?module=contract&action=getabi&address=0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413
// https://api.etherscan.io/apis

// ethers.js / web3.js get transaction (alchemy api) -> parse get contract address (to)
// -> (etherscan api) abi -> parse input function name
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

// try to parse a specific transaction
async function test() {
    const transactionHash = '0xafd279fa65f1cc820268f369a097aa76707b168b98fe715bf3174be6f2f5759b';
    let transaction = await web3.eth.getTransaction(transactionHash);
    let transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
    transaction = Object.assign(transaction, transactionReceipt);
    console.log("Transaction: ", transaction);
}

// get contract abi
const url = "https://api.etherscan.io/api?module=contract&action=getabi&address=0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d&apikey="+process.env.BOT_ETHERSCAN_KEY;
const fetch = require("node-fetch");
const InputDataDecoder = require('ethereum-input-data-decoder');

async function test() {    
    const json = await fetch(url)
    .then(response => response.json())
    .catch((e) => {});
    const abi = json['result'];
    // console.log(abi);
    const decoder = new InputDataDecoder(abi);
    const data = "0xa723533e0000000000000000000000000000000000000000000000000000000000000002";
    const result = decoder.decodeData(data);
    console.log(result['method']);
}

test()