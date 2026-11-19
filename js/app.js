const navBar = document.querySelector('.topbar-nav');
const sectionContainer = document.querySelector('.section-container');

navBar.addEventListener('click', navBarHandler);

sectionLoader('billing');

function navBarHandler(event) {
    const clickedLink = event.target.closest('.topbar-nav-link');

    if (!clickedLink) {
        return;
    }

    event.preventDefault();

    const sectionToLoad = clickedLink.dataset.page;

    navBar.querySelectorAll('.topbar-nav-link').forEach(link => {
        link.classList.remove('active');
    });

    clickedLink.classList.add('active');

    sectionLoader(sectionToLoad);
}

async function sectionLoader(sectionToLoad) {
    const response = await fetch(`sections/${sectionToLoad}.html`);
    const html = await response.text();

    sectionContainer.innerHTML = html;

    if (sectionToLoad === 'billing') {
        const billingModule = await import('./sections/billing.js');
        billingModule.initBillingSection();
    }

    else if (sectionToLoad === 'products') {
        const productsModule = await import('./sections/products.js');
        productsModule.initProductsSection();
    }

    else if (sectionToLoad === 'sales') {
        const salesModule = await import('./sections/sales.js');
        salesModule.initSalesSection();
    }
}