// services/pinata.ts
const pinataSDK = require('@pinata/sdk');

const PINATA_API_KEY = 'e5cb9588a16adadbb0b1';
const PINATA_SECRET_API_KEY = 'f010f7eda3a65569b77edae041f018111fbed5f2d8cc69b6e9ac3cdfea20362d';

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);

async function uploadJsonToIPFS(data, name = 'product-data') {
    const metadata = { name };
    const options = { cidVersion: 1 };

    const { IpfsHash } = await pinata.pinJSONToIPFS(data, {
        pinataMetadata: metadata,
        pinataOptions: options
    });

    return IpfsHash;
}

module.exports = { uploadJsonToIPFS };