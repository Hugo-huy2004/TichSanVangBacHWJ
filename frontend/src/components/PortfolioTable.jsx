import React from 'react';
import { formatMoney, formatPercent } from '../lib/format';

const PortfolioTable = ({ assets, onRemove }) => {
  return (
    <section className="panel--table">
      <div className="panel-heading">
        <h2>Tài sản cá nhân</h2>
        <span>Hiển thị lãi/lỗ thực tế, phần trăm và giá trị hiện tại của từng món.</span>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Doanh nghiệp</th>
              <th>Loại</th>
              <th>Ngày mua</th>
              <th>Giá mua</th>
              <th>Tiền công</th>
              <th>Khối lượng</th>
              <th>Lãi/lỗ</th>
              <th>%</th>
              <th>Ghi chú</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td data-label="Doanh nghiệp"><strong>{asset.providerName}</strong></td>
                <td data-label="Loại">{asset.assetType === 'Gold' ? 'Vàng' : 'Bạc'}</td>
                <td data-label="Ngày mua">{new Date(asset.purchaseDate).toLocaleDateString('vi-VN')}</td>
                <td data-label="Giá mua">{formatMoney(asset.purchasePrice)}</td>
                <td data-label="Tiền công">{formatMoney(asset.laborCost || 0)}</td>
                <td data-label="Khối lượng">{asset.weight} chỉ</td>
                <td data-label="Lãi/lỗ" className={asset.profit >= 0 ? 'positive' : 'negative'}>
                  {asset.profit >= 0 ? '+' : ''}{formatMoney(asset.profit)}
                </td>
                <td data-label="%" className={asset.profit >= 0 ? 'positive' : 'negative'}>{formatPercent(asset.percent)}</td>
                <td data-label="Ghi chú">{asset.note || 'Không có'}</td>
                <td data-label="Hành động">
                  <button className="text-button" onClick={() => onRemove(asset.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PortfolioTable;