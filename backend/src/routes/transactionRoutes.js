import express from 'express';
import {
    listTransactions,
    getStatistics,
    getBarChart,
    getPieChart,
    getCombinedData
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/transactions', listTransactions);
router.get('/statistics', getStatistics);
router.get('/barchart', getBarChart);
router.get('/piechart', getPieChart);
router.get('/combined', getCombinedData);

export default router;
