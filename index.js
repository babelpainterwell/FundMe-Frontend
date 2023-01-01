import { ethers } from "./ethers.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        connectButton.innerHTML = "Connected";
    } else {
        connectButton.innerHTML = "Please install Metamask to connect";
    }
}

// async function fund() {
//     const ethAmount = "0.1";
//     console.log(`Funding with ${ethAmount}...`);

//     // provider: hardhat local blockchain
//     // signer: local
//     // contract: abi & contractAddress

//     if (typeof window.ethereum !== "undefined") {
//         // metamask provides the provider
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         // get the account in metamask
//         const signer = provider.getSigner();
//         // contractAddress is acquired after deployment
//         const contract = new ethers.Contract(contractAddress, abi, signer);

//         try {
//             const transactionResponse = await contract.fund({
//                 value: ethers.utils.parseEther(ethAmount),
//             });
//         } catch (err) {
//             console.log(err);
//         }
//     }
// }

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!");
            // listen for the tx to be mined
            // Once the transaction response finsihes, we get the transaction receipt
        } catch (error) {
            console.log(error);
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask";
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(
            `Current funding pool has ${ethers.utils.formatEther(balance)} ETH`
        );
    } else {
        fundButton.innerHTML = "Please install MetaMask";
    }
}

async function withdraw() {
    // console.log(`Withdrawing funding pool to ${}`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        console.log(`Withdrawing funding pool to ${await signer.getAddress()}`);

        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!");
            // listen for the tx to be mined
            // Once the transaction response finsihes, we get the transaction receipt
        } catch (error) {
            console.log(error);
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask";
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed ${transactionReceipt.confirmations} confirmations`
            );
            resolve();
        });
    });
}
