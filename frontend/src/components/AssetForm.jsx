import React, { useMemo, useState } from 'react';

const AssetForm = ({ providers, onSubmit, onClose }) => {
  const defaultProvider = useMemo(() => providers[0]?.name || '', [providers]);
  const [form, setForm] = useState({
    providerName: defaultProvider,
    assetType: providers[0]?.type || 'Gold',
    purchaseDate: new Date().toISOString().slice(0, 10),
    purchasePrice: '',
    laborCost: '',
    weight: '',
    note: ''
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
    setForm({
      providerName: defaultProvider,
      assetType: providers[0]?.type || 'Gold',
      purchaseDate: new Date().toISOString().slice(0, 10),
      purchasePrice: '',
      laborCost: '',
      weight: '',
      note: ''
    });
  };

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <h2>Thêm tài sản</h2>
        <span>Chọn doanh nghiệp trong hệ thống để tính lãi/lỗ theo giá hiện tại.</span>
      </div>
      <label>
        Doanh nghiệp
        <select value={form.providerName} onChange={(event) => setForm({ ...form, providerName: event.target.value })}>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.name}>{provider.name}</option>
          ))}
        </select>
      </label>
      <label>
        Loại
        <select value={form.assetType} onChange={(event) => setForm({ ...form, assetType: event.target.value })}>
          <option value="Gold">Vàng</option>
          <option value="Silver">Bạc</option>
        </select>
      </label>
      <label>
        Ngày mua
        <input type="date" value={form.purchaseDate} onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })} />
      </label>
      <label>
        Giá mua
        <input type="number" value={form.purchasePrice} onChange={(event) => setForm({ ...form, purchasePrice: event.target.value })} placeholder="Giá lúc mua" required />
      </label>
      <label>
        Tiền công
        <input type="number" value={form.laborCost} onChange={(event) => setForm({ ...form, laborCost: event.target.value })} placeholder="Ví dụ 500000" />
      </label>
      <label>
        Khối lượng (chỉ)
        <input type="number" step="0.1" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} placeholder="Ví dụ 5" required />
      </label>
      <label className="full-width">
        Ghi chú
        <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Sổ tiết kiệm, cất két, quà tặng..." rows="3" />
      </label>
      <div className="form-actions full-width">
        {onClose ? <button className="form-close" type="button" onClick={onClose} aria-label="Đóng">×</button> : null}
        <button className="primary-button" type="submit">Lưu tài sản</button>
      </div>
    </form>
  );
};

export default AssetForm;