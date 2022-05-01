// ethers.js / web3.js get transaction (alchemy api) -> parse get contract address (to)
// -> (etherscan api) abi -> parse input function name
import dotenv from "dotenv";
dotenv.config();
import Web3 from "web3";
const web3 = new Web3(process.env.BOT_ALCHEMY_URL);
import fetch from "node-fetch";
import InputDataDecoder from "ethereum-input-data-decoder";

let latestKnownBlockNumber = -1;
let blockTime = 5000;

var cache = {};

const ETHERSCAN_INTERVAL = 200; // in ms
let invokedEtherscanApiCount = 0;

// Our function that will triggered for every block
async function processBlock(blockNumber) {
  console.log("####### We process block: " + blockNumber);
  let block = await web3.eth.getBlock(blockNumber);
  // console.log("new block :", block);
  const promises = block.transactions.map(async (transactionHash) => {
    let [transaction, transactionReceipt] = await Promise.all([
      web3.eth.getTransaction(transactionHash),
      web3.eth.getTransactionReceipt(transactionHash),
    ]);

    transaction = Object.assign(transaction, transactionReceipt);
    // console.log("Transaction: ", transaction);
    if (transaction.input != "0x") {
      try {
        let abi = "";
        if (transaction.to in cache) {
          console.log("### found the address");
          abi = cache[transaction.to];
        } else {
          await new Promise((resolve) =>
            setTimeout(resolve, ETHERSCAN_INTERVAL * invokedEtherscanApiCount++)
          );
          // get contract abi etherscan api call
          const url =
            "https://api.etherscan.io/api?module=contract&action=getabi&address=" +
            transaction.to +
            "&apikey=" +
            process.env.BOT_ETHERSCAN_KEY;

          // get abi
          const json = await fetch(url)
            .then((response) => response.json())
            .catch((e) => {});
          abi = json["result"];
          cache[transaction.to] = abi;
        }

        // decode data
        const decoder = new InputDataDecoder(abi);
        const data = transaction.input;
        const result = decoder.decodeData(data);

        // print function call
        console.log(transaction.to, result["method"]);
      } catch (e) {
        console.log(e);
        console.log(
          "### skip current transaction due to error unable to handle"
        );
      }
    }
  });
  await Promise.allSettled(promises);
  latestKnownBlockNumber = blockNumber;
}

// This function is called every blockTime, check the current block number and order the processing of the new block(s)
async function checkCurrentBlock() {
  const currentBlockNumber = await web3.eth.getBlockNumber();
  console.log(
    "Current blockchain top: " + currentBlockNumber,
    " | Script is at: " + latestKnownBlockNumber
  );
  while (
    latestKnownBlockNumber == -1 ||
    currentBlockNumber > latestKnownBlockNumber
  ) {
    await processBlock(
      latestKnownBlockNumber == -1
        ? currentBlockNumber
        : latestKnownBlockNumber + 1
    );
  }
  setTimeout(checkCurrentBlock, blockTime);
}

checkCurrentBlock();
