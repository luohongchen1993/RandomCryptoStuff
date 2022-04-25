import Web3 from "web3"; // load Web3 pacakge
import { readFileSync } from "fs"; // load fs pacakge to read json file
const erc20Abi = JSON.parse(readFileSync("./ABI/erc20.json")); // read json file

// set up BSC RPC url
const rpcUrl = "https://bsc-dataseed1.binance.org/";
const rpcWeb3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

let web3 = rpcWeb3;

// https://www.investopedia.com/terms/w/wei.asp
function getWeiName(tokenDecimals = 18) {
  tokenDecimals = Number(tokenDecimals);
  let weiName = "ether";
  switch (tokenDecimals) {
    case 3:
      weiName = "Kwei";
      break;
    case 6:
      weiName = "mwei";
      break;
    case 9:
      weiName = "gwei";
      break;
    case 12:
      weiName = "microether ";
      break;
    case 15:
      weiName = "milliether";
      break;
    case 18:
      weiName = "ether";
      break;
    default:
      weiName = "ether";
      break;
  }
  return weiName;
}

const getBnbBalance = async (address) => {
  let result = await web3.eth.getBalance(address);
  if (result) {
    let balance = web3.utils.fromWei(result, getWeiName());
    return balance;
  } else {
    console.error("Getting Bnb Balance error.");
  }
};

const getTokenBalance = async (tokenAddress, address) => {
  // get contract from abi and address
  let tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
  // get balance of contract
  let result = await tokenContract.methods.balanceOf(address).call();
  // get decimal of the coin
  let decimals = await tokenContract.methods.decimals().call();
  let weiName = getWeiName(decimals);
  let tokenBalance = web3.utils.fromWei(result, weiName);
  // get token symbol
  let symbol = await tokenContract.methods.symbol().call();
  return `${tokenBalance} ${symbol}`;
};

async function main() {
  let myWallet = "0x11e78fC4B70014d7B8978287bA3c5103D80dDd06";
  let walletBalance = await getBnbBalance(myWallet);
  console.log(`wallet: [${myWallet}] has ${walletBalance} BNB`);
  let tokens = [];
  tokens.push("0x55d398326f99059ff775485246999027b3197955");
  tokens.push("0x3fda9383a84c05ec8f7630fe10adf1fac13241cc");
  tokens.push("0x42712df5009c20fee340b245b510c0395896cf6e");
  tokens.push("0x373233A38ae21cF0C4f9DE11570E7D5Aa6824A1E");
  tokens.push("0x04645027122c9f152011f128c7085449b27cb6d7");
  tokens.push("0x740b40760266d54362c222c0490a95cf970cd199");
  tokens.push("0x7c357cd85bb600f748ec1d82adef74464c13e7a7");
  tokens.push("0xf0d585a29a86c25819526ba494100951dc31aa0b");
  tokens.push("0x366945ba85881b77c186597b4639683efeeb65ca");
  tokens.push("0xfb9f5738c9d767fea5af6e4d826ce18d1a48589a");
  for (let token of tokens) {
    let balance = await getTokenBalance(token, myWallet);
    console.log(`wallet: [${myWallet}] has ${balance}`);
  }
}

// start program
main();
