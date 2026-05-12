const formatter = new Intl.NumberFormat('vi-VN');

export const formatMoney = (value) => `${formatter.format(Math.round(Number(value) || 0))} VND`;

export const formatPercent = (value) => `${(Number(value) || 0).toFixed(2)}%`;

export const toDateInputValue = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toISOString().slice(0, 10);
};

export const fromDateInputValue = (value) => new Date(`${value}T00:00:00`);