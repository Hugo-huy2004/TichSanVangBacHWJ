import React, { useState } from 'react';

const PriceForm = ({ onSubmit, onClose, defaultType = 'Gold' }) => {
  const [form, setForm] = useState({
    name: '',
    type: defaultType,
    buy: '',
    sell: '',
    apiUrl: ''
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
    setForm({ name: '', type: defaultType, buy: '', sell: '', apiUrl: '' });
  };

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <h2>Thêm giá vàng/bạc</h2>
        <span>Nếu nhập API, hệ thống sẽ lấy giá mua/bán từ nguồn đó.</span>
      </div>
      <label>
        Tên doanh nghiệp
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="SJC, PNJ, Mi Hồng..." required />
      </label>
      <label>
        Loại
        <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
          <option value="Gold">Vàng</option>
          <option value="Silver">Bạc</option>
        </select>
      </label>
      <label>
        Giá mua
        <input type="number" value={form.buy} onChange={(event) => setForm({ ...form, buy: event.target.value })} placeholder="Ví dụ 82000000" />
      </label>
      <label>
        Giá bán
        <input type="number" value={form.sell} onChange={(event) => setForm({ ...form, sell: event.target.value })} placeholder="Ví dụ 84500000" />
      </label>
      <label className="full-width">
        API nếu có
        <input value={form.apiUrl} onChange={(event) => setForm({ ...form, apiUrl: event.target.value })} placeholder="https://api.example.com/prices" />
      </label>
      <div className="form-actions full-width">
        {onClose ? <button className="form-close" type="button" onClick={onClose} aria-label="Đóng">×</button> : null}
        <button className="primary-button" type="submit">Lưu giá</button>
      </div>
    </form>
  );
};

export default PriceForm;