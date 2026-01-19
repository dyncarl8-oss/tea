
import express from 'express';
import { Product } from '../models/Content.js';

const router = express.Router();

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

export default router;
