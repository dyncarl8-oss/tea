
import express from 'express';
import { Symptom } from '../models/Content.js';
import { Product } from '../models/Content.js';

const router = express.Router();

router.get('/symptoms', async (req, res) => {
    try {
        const symptoms = await Symptom.find().populate('recommendedProductIds');
        res.json(symptoms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch symptoms' });
    }
});

router.post('/symptoms', async (req, res) => {
    try {
        const symptom = new Symptom(req.body);
        await symptom.save();
        res.json(symptom);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create symptom' });
    }
});

export default router;
