// ethers.js / web3.js get transaction (alchemy api) -> parse get contract address (to)
// -> (etherscan api) abi -> parse input function name
const dotenv = require("dotenv");
dotenv.config();
var Web3 = require('web3');
const web3 = new Web3(process.env.BOT_ALCHEMY_KEY);
const fetch = require("node-fetch");
const InputDataDecoder = require('ethereum-input-data-decoder');

let latestKnownBlockNumber = -1;
let blockTime = 5000;

var cache = {};

// Our function that will triggered for every block

async function sleep() {
    console.log('sleep')
}

async function processBlock(blockNumber) {
    console.log("####### We process block: " + blockNumber);
    let block = await web3.eth.getBlock(blockNumber);
    // console.log("new block :", block)
    for (const transactionHash of block.transactions) {
        let transaction = await web3.eth.getTransaction(transactionHash);
        let transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
        transaction = Object.assign(transaction, transactionReceipt);
        // console.log("Transaction: ", transaction);
        if (transaction.input != '0x'){

            try{
                var abi = "";
                if (transaction.to in cache){
                    console.log("### found the address");
                    abi = cache[transaction.to];
                }else{
                    // get contract abi etherscan api call
                    const url = "https://api.etherscan.io/api?module=contract&action=getabi&address="+transaction.to+"&apikey="+process.env.BOT_ETHERSCAN_KEY;

                    // get abi
                    const json = await fetch(url)
                    .then(response => response.json())
                    .catch((e) => {});
                    abi = json['result'];
                    cache[transaction.to] = abi;

                    // sleep to avoid hitting etherscan limit
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

                // decode data
                const decoder = new InputDataDecoder(abi);
                const data = transaction.input;
                const result = decoder.decodeData(data);

                // print function call
                console.log(transaction.to, result['method']);
            }
            catch(e){
                console.log(e);
                console.log('### skip current transaction due to error unable to handle');
            }
        }
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

checkCurrentBlock()
