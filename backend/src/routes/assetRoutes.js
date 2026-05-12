const express = require('express');
const { listAssets, createAsset, deleteAsset, bootstrapAssets } = require('../controllers/assetController');

const router = express.Router();

router.get('/', listAssets);
router.get('/bootstrap', bootstrapAssets);
router.post('/', createAsset);
router.delete('/:id', deleteAsset);

module.exports = router;