import { products } from '../data/store.js';

export function initProductsSection() {
    const productModelOpenButton = document.getElementById('add-product-btn');
    const productModal = document.getElementById('add-product-modal');
    const productForm = document.getElementById('add-product-form');
    const productModelCloseButton = document.getElementById('add-product-close');
    const productModelCancelButton = document.getElementById('add-product-cancel');
    const totalStockCard = document.getElementById('stat-total');
    const lowStockCard = document.getElementById('stat-low');
    const outOfStockCard = document.getElementById('stat-out');
    const productsTableBody = document.getElementById('products-tbody');

    let editId = null;

    productModelOpenButton.addEventListener('click', openProductModal);
    productForm.addEventListener('submit', productFormHandler);
    [productModelCloseButton, productModelCancelButton].forEach(button => {
        button.addEventListener('click', closeProductModal);
    });
    productsTableBody.addEventListener('click', handleProductTableClick);

    function openProductModal() {
        editId = null;
        productForm.reset();
        productModal.hidden = false;
    }

    function productFormHandler(event) {
        event.preventDefault();

        const rawData = Object.fromEntries(new FormData(productForm));

        if(!rawData.name.trim() || !rawData.quantity.trim() || !rawData.price.trim() || !rawData.reorderLevel.trim()) {
            alert('Please fill in all fields');
            return;
        }

        const name = rawData.name.trim();

        if(products.some(product => product.name.toLowerCase() === name.toLowerCase() && product.id !== editId)) {
            alert('Product already exists');
            return;
        }

        const quantity = Number(rawData.quantity);
        const price = Number(rawData.price);
        const reorderLevel = Number(rawData.reorderLevel);

        if(quantity < 0 || !Number.isInteger(quantity)) {
            alert('Quantity must be a non-negative integer');
            return;
        }

        if(price <= 0) {
            alert('Price must be a positive number');
            return;
        }

        if(reorderLevel < 0 || !Number.isInteger(reorderLevel)) {
            alert('Reorder level must be a non-negative integer');
            return;
        }

        const payload = {
            name: name,
            quantity: quantity,
            price: price,
            reorderLevel: reorderLevel
        };

        if(editId) {
            const productIndex = products.findIndex(product => product.id === editId);
            payload.id = editId;
            products[productIndex] = payload;
        }

        else {
            payload.id = crypto.randomUUID();
            products.push(payload);
        }

        closeProductModal();
        renderSectionData();
    }

    function closeProductModal() {
        editId = null;
        productForm.reset();
        productModal.hidden = true;
    }

    function renderSectionData() {
        renderStatCards();
        renderProductsTable();
    }

    function renderStatCards() {
        const totalProducts = products.length;
        const lowStockProducts = products.filter(product => product.quantity <= product.reorderLevel).length;
        const outOfStockProducts = products.filter(product => product.quantity === 0).length;

        totalStockCard.textContent = totalProducts;
        lowStockCard.textContent = lowStockProducts;
        outOfStockCard.textContent = outOfStockProducts;
    }

    function renderProductsTable() {
        if(products.length === 0) {
            productsTableBody.innerHTML = '';
            document.getElementById('products-empty').hidden = false;
            return;
        }

        document.getElementById('products-empty').hidden = true;

        productsTableBody.innerHTML = '';

        products.forEach((product) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="col-id">${product.id}</td>
                <td class="col-name">${product.name}</td>
                <td class="col-qty">${product.quantity}</td>
                <td class="col-reorder">${product.reorderLevel}</td>
                <td class="col-price">${product.price}</td>
                <td class="col-actions">
                    <button type="button" class="btn btn-sm btn-ghost btn-edit" aria-label="Edit">Edit</button>
                    <button type="button" class="btn btn-sm btn-ghost btn-delete" aria-label="Delete">Delete</button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    }

    function handleProductTableClick(event) {
        const clickedButton = event.target.closest('button');
        const rowId = clickedButton.closest('tr').dataset.id;

        if(clickedButton.classList.contains('btn-edit')) {
            handleEditProduct(rowId);
        }

        else if(clickedButton.classList.contains('btn-delete')) {
            handleDeleteProduct(rowId);
        }
    }

    function handleEditProduct(rowId) {
        const product = products.find(product => product.id === rowId);
        editId = rowId;

        productForm.elements.name.value = product.name;
        productForm.elements.quantity.value = product.quantity;
        productForm.elements.price.value = product.price;
        productForm.elements.reorderLevel.value = product.reorderLevel;
        productModal.hidden = false;
    }

    function handleDeleteProduct(rowId) {
        const productIndex = products.findIndex(product => product.id === rowId);
        const productName = products[productIndex].name;

        if(confirm(`Are you sure you want to delete "${productName}"?`)) {
            products.splice(productIndex, 1);
            renderSectionData();
        }
    }

    renderSectionData();
}