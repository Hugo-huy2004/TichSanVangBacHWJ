const Price = require('../models/Price');
const { fetchMarketPrices, normalizeIncomingPrice } = require('../services/priceService');

const listPrices = async (request, response, next) => {
  try {
    const prices = await Price.find().sort({ updatedAt: -1 });

    response.json(prices);
  } catch (error) {
    next(error);
  }
};

const createPrice = async (request, response, next) => {
  try {
    const payload = request.body.apiUrl
      ? await fetchMarketPrices(request.body.apiUrl, request.body.name, request.body.type)
      : request.body;

    const normalized = normalizeIncomingPrice(payload, request.body.name, request.body.type);
    const price = await Price.findOneAndUpdate(
      { name: normalized.name },
      {
        name: normalized.name,
        type: normalized.type,
        buy: normalized.buy,
        sell: normalized.sell,
        source: request.body.apiUrl ? 'api' : 'manual',
        apiUrl: request.body.apiUrl || ''
      },
      { new: true, upsert: true }
    );

    response.status(201).json(price);
  } catch (error) {
    next(error);
  }
};

const deletePrice = async (request, response, next) => {
  try {
    await Price.deleteOne({ _id: request.params.id });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

const bootstrapPrices = async (request, response, next) => {
  try {
    const prices = await Price.find().sort({ updatedAt: -1 });
    response.json(prices);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPrices,
  createPrice,
  deletePrice,
  bootstrapPrices
};