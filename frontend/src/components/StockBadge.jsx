import { stockStatus } from '../utils/product.js';

export default function StockBadge({ stock }) {
    const status = stockStatus(stock);
    return <span className={`stock-badge ${status.className}`}><span aria-hidden="true" />{status.label}</span>;
}