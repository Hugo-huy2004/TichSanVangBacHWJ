export const defaultMarketPrices = [];

const parseNumericValue = (value) => {
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

const resolvePair = (payload) => {
  const buy = deepFind(payload, (key, value) => /^(buy|mua|purchase|buyingprice|purchaseprice)$/i.test(key) && parseNumericValue(value) !== null);
  const sell = deepFind(payload, (key, value) => /^(sell|ban|sale|sellingprice)$/i.test(key) && parseNumericValue(value) !== null);

  return {
    buy: parseNumericValue(buy),
    sell: parseNumericValue(sell)
  };
};

export const normalizePricePayload = (payload, fallbackName, fallbackType) => {
  const first = pickBestItem(payload, fallbackName);
  const { buy, sell } = resolvePair(first);

  return {
    name: first.name || first.company || first.code || fallbackName,
    type: first.type || fallbackType,
    buy: buy ?? parseNumericValue(first.buyingPrice) ?? parseNumericValue(first.buy) ?? parseNumericValue(first.purchasePrice) ?? 0,
    sell: sell ?? parseNumericValue(first.sellingPrice) ?? parseNumericValue(first.sell) ?? parseNumericValue(first.sellingPrice) ?? 0
  };
};

export const createPriceRow = ({ name, type, buy, sell, source, apiUrl }) => ({
  id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
  name,
  type,
  buy: Number(buy),
  sell: Number(sell),
  source,
  apiUrl,
  updatedAt: new Date().toISOString()
});