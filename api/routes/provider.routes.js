const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const contract = require('../contract/contract');
const { ethers } = require('ethers');
const { uploadJsonToIPFS } = require('../contract/pinata');
const Product = require('../models/product.model');
const formatResponse = require('../middlewares/responseFormat');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        /** 1. Validate & lấy data từ body */
        const data = req.body;

        const product = await Product.findById(data?.productId);
        if (!data?.productId || !product) {
            return res.status(400).json(formatResponse(false, null, "Product ID is invalid"));
        }

        /** 2. Upload JSON lên IPFS */
        const cid = await uploadJsonToIPFS(data);

        /** 3. Ghi cid lên blockchain */
        const tx = await contract.addProductTrace(data.productId, cid);
        const receipt = await tx.wait();     // đợi mined (có thể bắt timeout)
        product.isTraceVerified = true;
        product.traceHistories.push({
            cid,
            blockNumber: receipt.blockNumber
        })
        await product.save()
        /** 4. Trả về kết quả */
        return res.json(formatResponse(
            true,
            {
                success: true,
                cid,
                txHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber
            },
            "Trace product successfully")
        );

    } catch (err) {
        console.error('Traceability error:', err);
        return res.status(500).json(formatResponse(false, null, "Internal server error, err:" + err.message));
    }
});


async function getCIDFromBlockchain(productId) {
    const trace = await contract.getProductTrace(productId); // contract trả về CID dạng string
    const formattedTrace = {
        currentCid: trace[0],
        cidHistory: trace[1],
        seller: trace[2],
        createdAt: trace[3].toString(),
    };
    return formattedTrace.currentCid;
}

async function fetchJSONFromIPFS(cid) {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const response = await axios.get(url);
    return response.data;
}

router.get('/', async (req, res) => {
    try {
        const { productId } = req.query;

        if (!productId) {
            return res.status(400).json(formatResponse(false,
                { success: false, error: 'Product ID invalid' },
                ""
            ));
        }

        // 1. Lấy CID từ blockchain
        const cid = await getCIDFromBlockchain(productId);
        if (!cid) {
            return res.status(404).json(formatResponse(false,
                { success: false, error: 'No trace data found for this productId' },
                ""
            ));
        }
        // 2. Lấy data thực tế từ IPFS
        const traceData = await fetchJSONFromIPFS(cid);

        // 3. Trả về dữ liệu
        return res.json(formatResponse(
            true,
            {
                success: true,
                productId,
                cid,
                traceData
            },
            "Successfully"
        ));

    } catch (err) {
        console.error('Error fetching product trace:', err);
        return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
});

module.exports = router;
