import React from 'react';
import { formatMoney } from '../lib/format';

const PriceTable = ({ prices, onRemove }) => {
  if (!prices.length) {
    return (
      <section className="panel--table">
        <div className="panel-heading">
          <h2>Bảng giá thị trường</h2>
          <span>Chưa có giá nào được chia sẻ. Hãy bấm + để thêm giá đầu tiên cho toàn hệ thống.</span>
        </div>
        <div className="empty-state">
          Bảng giá đang trống.
        </div>
      </section>
    );
  }

  return (
    <section className="panel--table">
      <div className="panel-heading">
        <h2>Bảng giá thị trường</h2>
        <span>Cập nhật realtime, có thể nhập thủ công hoặc lấy từ API.</span>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Doanh nghiệp</th>
              <th>Loại</th>
              <th>Mua</th>
              <th>Bán</th>
              <th>Nguồn</th>
              <th>Cập nhật</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {prices.map((price) => (
              <tr key={price.id}>
                <td data-label="Doanh nghiệp">
                  <strong>{price.name}</strong>
                </td>
                <td data-label="Loại">{price.type === 'Gold' ? 'Vàng' : 'Bạc'}</td>
                <td data-label="Mua">{formatMoney(price.buy)}</td>
                <td data-label="Bán" className="accent">{formatMoney(price.sell)}</td>
                <td data-label="Nguồn">
                  <span className={`source-pill source-pill--${price.source}`}>{price.source === 'api' ? 'API' : 'Thủ công'}</span>
                </td>
                <td data-label="Cập nhật">{new Date(price.updatedAt).toLocaleString('vi-VN')}</td>
                <td data-label="Hành động">
                  <button className="text-button" onClick={() => onRemove(price.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PriceTable;