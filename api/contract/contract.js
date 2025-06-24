const { ethers } = require("ethers");
require("dotenv").config();

const abi = [
    {
        "inputs": [
            { "internalType": "string", "name": "productId", "type": "string" },
            { "internalType": "string", "name": "cid", "type": "string" }
        ],
        "name": "addProductTrace",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "productId", "type": "string" },
            { "internalType": "string", "name": "newCid", "type": "string" }
        ],
        "name": "updateProductCid",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "productId", "type": "string" }
        ],
        "name": "getProductTrace",
        "outputs": [
            { "internalType": "string", "name": "cid", "type": "string" },
            { "internalType": "string[]", "name": "cidHistory", "type": "string[]" },
            { "internalType": "address", "name": "seller", "type": "address" },
            { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
            {
                "internalType": "enum ProductTraceability.VerifyStatus",
                "name": "status",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.ETHEREUM_CONTRACT_ADDRESS, abi, wallet);

module.exports = contract;
