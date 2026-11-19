import { products, sales } from '../data/store.js';

export function initBillingSection() {
    const searchBar = document.getElementById('billing-search');
    const searchResultsContainer = document.getElementById('billing-results');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const checkoutButton = document.getElementById('checkout-btn');

    let cart = [];

    searchBar.addEventListener('input', handleSearchInput);
    searchResultsContainer.addEventListener('click', handleResultClick);
    cartItemsContainer.addEventListener('click', handleCartClick);
    checkoutButton.addEventListener('click', handleCheckout);

    renderSearchResults(products);

    function handleSearchInput(event) {
        const searchTerm = event.target.value.trim().toLowerCase();
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
        renderSearchResults(filteredProducts);
    }

    function renderSearchResults(filteredProducts) {
        searchResultsContainer.innerHTML = '';

        if (filteredProducts.length === 0) {
            searchResultsContainer.innerHTML = '<p class="product-results-empty">No products found</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const isOutOfStock = product.quantity === 0;

            const card = document.createElement('button');
            card.type = 'button';
            
            let cardClass = 'product-card';
            if (isOutOfStock) {
                cardClass = cardClass + ' is-out';
            }
            card.className = cardClass;

            card.dataset.id = product.id;
            card.disabled = isOutOfStock;

            let stockText = '';
            if (isOutOfStock) {
                stockText = 'Out of stock';
            } 
            
            else {
                stockText = product.quantity + ' in stock';
            }

            card.innerHTML = `
                <span class="product-card-name">${product.name}</span>
                <span class="product-card-price">${Number(product.price).toFixed(2)}</span>
                <span class="product-card-stock">${stockText}</span>
            `;

            searchResultsContainer.appendChild(card);
        });
    }

    function handleResultClick(event) {
        const card = event.target.closest('.product-card');
        if (!card || card.disabled) return;

        addToCart(card.dataset.id);
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            if (existingItem.quantity >= product.quantity) return;
            existingItem.quantity += 1;
        } 
        
        else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: 1
            });
        }

        renderCart();
    }

    function handleCartClick(event) {
        const btn = event.target.closest('button');
        if (!btn) return;

        const cartItemDiv = btn.closest('.cart-item');
        if (!cartItemDiv) return;

        const productId = cartItemDiv.dataset.id;
        const item = cart.find(i => i.productId === productId);

        if (!item) return;

        if (btn.classList.contains('qty-btn')) {
            if (btn.dataset.action === 'increase') {
                const product = products.find(p => p.id === productId);
                
                if (!product) return;

                if (item.quantity < product.quantity) {
                    item.quantity += 1;
                }
            } 
            
            else if (btn.dataset.action === 'decrease') {
                item.quantity -= 1;
                
                if (item.quantity <= 0) {
                    cart = cart.filter(i => i.productId !== productId);
                }
            }
            renderCart();
        }

        if (btn.classList.contains('cart-item-remove')) {
            cart = cart.filter(i => i.productId !== productId);
            renderCart();
        }
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartEmpty.hidden = false;
            checkoutButton.disabled = true;
            updateTotals(0);
            return;
        }

        cartEmpty.hidden = true;
        checkoutButton.disabled = false;

        cart.forEach(item => {
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.dataset.id = item.productId;

            row.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} each</div>
                </div>
                <div class="cart-item-qty">
                    <button type="button" class="qty-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button type="button" class="qty-btn" data-action="increase" aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
                <button type="button" class="cart-item-remove" aria-label="Remove item">×</button>
            `;

            cartItemsContainer.appendChild(row);
        });

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        updateTotals(subtotal);
    }

    function updateTotals(totalAmount) {
        const totalElement = document.getElementById('cart-total');
        
        if (totalElement !== null) {
            totalElement.textContent = totalAmount.toFixed(2);
        }
    }

    function handleCheckout() {
        if (cart.length === 0) return;

        const newSale = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        sales.push(newSale);

        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.productId);
            
            if (product !== undefined) {
                product.quantity -= cartItem.quantity;
            }
        });

        cart = [];
        renderCart();
        renderSearchResults(products); 
        
        alert('Sale completed successfully!');
    }
}