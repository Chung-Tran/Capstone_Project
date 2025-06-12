// services/pinata.ts
const pinataSDK = require('@pinata/sdk');

const PINATA_API_KEY = 'string';
const PINATA_SECRET_API_KEY = 'string';

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