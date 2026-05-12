const Asset = require('../models/Asset');

const getUserId = (request) => request.headers['x-user-id'] || request.query.userId;

const listAssets = async (request, response, next) => {
  try {
    const userId = getUserId(request);
    const assets = userId ? await Asset.find({ userId }).sort({ purchaseDate: -1 }) : [];
    response.json(assets);
  } catch (error) {
    next(error);
  }
};

const createAsset = async (request, response, next) => {
  try {
    const userId = getUserId(request);

    if (!userId) {
      return response.status(400).json({ message: 'userId is required' });
    }

    const asset = await Asset.create({
      userId,
      providerName: request.body.providerName,
      assetType: request.body.assetType,
      purchaseDate: request.body.purchaseDate || Date.now(),
      purchasePrice: request.body.purchasePrice,
      laborCost: request.body.laborCost || 0,
      weight: request.body.weight,
      note: request.body.note || ''
    });

    response.status(201).json(asset);
  } catch (error) {
    next(error);
  }
};

const deleteAsset = async (request, response, next) => {
  try {
    const userId = getUserId(request);
    await Asset.deleteOne({ _id: request.params.id, userId });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

const bootstrapAssets = async (request, response, next) => {
  try {
    const userId = getUserId(request);
    const assets = userId ? await Asset.find({ userId }).sort({ purchaseDate: -1 }) : [];
    response.json(assets);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAssets,
  createAsset,
  deleteAsset,
  bootstrapAssets
};