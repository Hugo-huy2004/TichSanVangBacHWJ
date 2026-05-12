const express = require('express');
const { listPrices, createPrice, deletePrice, bootstrapPrices } = require('../controllers/priceController');

const router = express.Router();

router.get('/', listPrices);
router.get('/bootstrap', bootstrapPrices);
router.post('/', createPrice);
router.delete('/:id', deletePrice);

module.exports = router;