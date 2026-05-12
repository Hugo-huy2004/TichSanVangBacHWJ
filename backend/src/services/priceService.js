const axios = require('axios');

const parseNumeric = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const pickBestItem = (payload, fallbackName) => {
  const list = Array.isArray(payload) ? payload : [payload];
  const target = normalizeText(fallbackName);

  if (!target) {
    return list.find(Boolean) || {};
  }

  return (
    list.find((item) => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const code = normalizeText(item.code);
      const name = normalizeText(item.name || item.company || item.providerName);
      return code === target || name === target;
    }) || list.find(Boolean) || {}
  );
};

const deepFind = (input, matcher) => {
  if (Array.isArray(input)) {
    for (const item of input) {
      const matched = deepFind(item, matcher);
      if (matched !== null) {
        return matched;
      }
    }

    return null;
  }

  if (!input || typeof input !== 'object') {
    return null;
  }

  for (const [key, value] of Object.entries(input)) {
    if (matcher(key, value)) {
      return value;
    }

    const nested = deepFind(value, matcher);
    if (nested !== null) {
      return nested;
    }
  }

  return null;
};

const normalizeIncomingPrice = (payload, fallbackName, fallbackType = 'Gold') => {
  const source = pickBestItem(payload, fallbackName);
  const buyCandidate = deepFind(source, (key, value) => /^(buy|mua|purchase|buyingprice|purchaseprice)$/i.test(key) && parseNumeric(value) !== null);
  const sellCandidate = deepFind(source, (key, value) => /^(sell|ban|sale|sellingprice)$/i.test(key) && parseNumeric(value) !== null);

  return {
    name: source.name || source.company || source.code || fallbackName,
    type: source.type || fallbackType,
    buy: parseNumeric(buyCandidate) ?? parseNumeric(source.buyingPrice) ?? parseNumeric(source.buy) ?? parseNumeric(source.purchasePrice) ?? 0,
    sell: parseNumeric(sellCandidate) ?? parseNumeric(source.sellingPrice) ?? parseNumeric(source.sell) ?? parseNumeric(source.sellingPrice) ?? 0
  };
};

const fetchMarketPrices = async (apiUrl, fallbackName, fallbackType = 'Gold') => {
  const response = await axios.get(apiUrl, { timeout: 15000 });
  return normalizeIncomingPrice(response.data, fallbackName, fallbackType);
};

module.exports = { fetchMarketPrices, normalizeIncomingPrice };