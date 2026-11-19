import { sales } from '../data/store.js';

export function initSalesSection() {
    const statSalesCount = document.getElementById('stat-sales-count');
    const statSalesRevenue = document.getElementById('stat-sales-revenue');
    const salesTbody = document.getElementById('sales-tbody');
    const salesEmpty = document.getElementById('sales-empty');
    const saleModal = document.getElementById('sale-modal');
    const saleModalClose = document.getElementById('sale-modal-close');
    const saleDetailId = document.getElementById('sale-detail-id');
    const saleDetailDate = document.getElementById('sale-detail-date');
    const saleDetailItems = document.getElementById('sale-detail-items');
    const saleDetailTotal = document.getElementById('sale-detail-total');

    salesTbody.addEventListener('click', handleTableClick);
    saleModalClose.addEventListener('click', closeModal);
    saleModal.addEventListener('click', (event) => {
        if (event.target === saleModal) {
            closeModal();
        }
    });

    renderSales();

    function renderSales() {
        const totalCount = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        
        statSalesCount.textContent = totalCount;
        statSalesRevenue.textContent = totalRevenue.toFixed(2);

        if (sales.length === 0) {
            salesTbody.innerHTML = '';
            salesEmpty.hidden = false;
            return;
        }

        salesEmpty.hidden = true;
        salesTbody.innerHTML = '';

        const reversedSales = [...sales].reverse();

        reversedSales.forEach(sale => {
            const row = document.createElement('tr');
            row.className = 'sales-row';
            row.dataset.id = sale.id;

            const dateObj = new Date(sale.date);
            const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const itemCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);

            row.innerHTML = `
                <td class="col-id">${sale.id}</td>
                <td class="col-date">${formattedDate}</td>
                <td class="col-qty">${itemCount}</td>
                <td class="col-price">${sale.total.toFixed(2)}</td>
                <td class="col-actions">
                    <button type="button" class="btn btn-sm btn-ghost btn-delete" aria-label="Delete">Delete</button>
                </td>
            `;

            salesTbody.appendChild(row);
        });
    }

    function handleTableClick(event) {
        const row = event.target.closest('tr');
        if (!row) return;

        const saleId = row.dataset.id;
        const isDeleteBtn = event.target.closest('.btn-delete');

        if (isDeleteBtn) {
            event.stopPropagation(); 
            handleDeleteSale(saleId);
        } else {
            openSaleModal(saleId);
        }
    }

    function handleDeleteSale(saleId) {
        if (!confirm('Are you sure you want to delete this sale record? (Note: This does NOT refund inventory stock).')) {
            return;
        }

        const index = sales.findIndex(sale => sale.id === saleId);
        if (index !== -1) {
            sales.splice(index, 1);
            renderSales();
        }
    }

    function openSaleModal(saleId) {
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;

        saleDetailId.textContent = sale.id;
        const dateObj = new Date(sale.date);
        saleDetailDate.textContent = dateObj.toLocaleString();
        saleDetailTotal.textContent = sale.total.toFixed(2);

        saleDetailItems.innerHTML = '';
        
        sale.items.forEach(item => {
            const tr = document.createElement('tr');
            const lineTotal = item.price * item.quantity;
            
            tr.innerHTML = `
                <td>${item.name}</td>
                <td class="col-qty">${item.quantity}</td>
                <td class="col-price">${lineTotal.toFixed(2)}</td>
            `;
            saleDetailItems.appendChild(tr);
        });

        saleModal.hidden = false;
    }

    function closeModal() {
        saleModal.hidden = true;
    }
}