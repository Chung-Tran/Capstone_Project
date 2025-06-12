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

const provider = new ethers.JsonRpcProvider("string");
const wallet = new ethers.Wallet("string", provider);
const contract = new ethers.Contract("string", abi, wallet);
module.exports = contract;
