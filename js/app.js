/**
 * متجر رونق الفاخر - الجمهورية اليمنية (Rawnaq Yemen Store) - المنطق البرمجي والتفاعلي
 */

// ==========================================
// الحالة العامة للتطبيق (Application State)
// ==========================================
const AppState = {
    cart: JSON.parse(localStorage.getItem('rawnaq_yemen_cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('rawnaq_yemen_wishlist')) || [],
    theme: localStorage.getItem('rawnaq_yemen_theme') || 'light',
    appliedCoupon: null,
    discountAmount: 0,
    filters: {
        category: 'all',
        maxPrice: 400000,
        minRating: 0,
        inStockOnly: false,
        searchQuery: '',
        sortBy: 'featured'
    },
    quickViewProduct: null,
    selectedQuickViewColor: null
};

const FREE_SHIPPING_THRESHOLD = 100000; // شحن مجاني للطلبات أكثر من 100,000 ر.ي

// ==========================================
// التهيئة عند تحميل الصفحة (Initialization)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderCategories();
    renderProducts();
    updateCartUI();
    updateWishlistBadge();
    initEventListeners();
    initFlashSaleCountdown();
});

// ==========================================
// نظام الوضع الليلي / النهاري (Theme System)
// ==========================================
function initTheme() {
    document.documentElement.setAttribute('data-theme', AppState.theme);
    updateThemeToggleIcons();
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', AppState.theme);
    localStorage.setItem('rawnaq_yemen_theme', AppState.theme);
    updateThemeToggleIcons();
    showToast(`تم التبديل إلى ${AppState.theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}`, 'info', 'fa-moon');
}

function updateThemeToggleIcons() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.innerHTML = AppState.theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }
}

// ==========================================
// عرض التصنيفات (Render Categories)
// ==========================================
function renderCategories() {
    const container = document.getElementById('categoriesNav');
    if (!container) return;

    const categories = getStoreCategories();
    container.innerHTML = categories.map(cat => `
        <button class="category-chip ${AppState.filters.category === cat.id ? 'active' : ''}" onclick="selectCategory('${cat.id}')">
            <i class="fa-solid ${cat.icon || 'fa-cubes'}"></i>
            <span>${cat.name}</span>
        </button>
    `).join('');
}

function selectCategory(catId) {
    AppState.filters.category = catId;
    renderCategories();
    
    const radio = document.querySelector(`input[name="categoryFilter"][value="${catId}"]`);
    if (radio) radio.checked = true;

    renderProducts();
}

// ==========================================
// عرض المنتجات والتصفية (Render & Filter Products)
// ==========================================
function getFilteredProducts() {
    const allProducts = getStoreProducts();
    return allProducts.filter(product => {
        if (AppState.filters.category !== 'all' && product.category !== AppState.filters.category) {
            return false;
        }
        if (product.price > AppState.filters.maxPrice) {
            return false;
        }
        if (AppState.filters.minRating > 0 && (product.rating || 5) < AppState.filters.minRating) {
            return false;
        }
        if (AppState.filters.inStockOnly && !product.inStock) {
            return false;
        }
        if (AppState.filters.searchQuery.trim() !== '') {
            const query = AppState.filters.searchQuery.toLowerCase();
            const matchName = product.name.toLowerCase().includes(query);
            const matchDesc = (product.description || '').toLowerCase().includes(query);
            if (!matchName && !matchDesc) return false;
        }
        return true;
    }).sort((a, b) => {
        if (AppState.filters.sortBy === 'price-asc') return a.price - b.price;
        if (AppState.filters.sortBy === 'price-desc') return b.price - a.price;
        if (AppState.filters.sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        if (AppState.filters.sortBy === 'discount') return (b.discount || 0) - (a.discount || 0);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const countEl = document.getElementById('productCount');
    if (!grid) return;

    const allProducts = getStoreProducts();
    const filtered = getFilteredProducts();

    if (countEl) {
        countEl.innerHTML = `عرض <strong>${filtered.length}</strong> من أصل ${allProducts.length} منتج`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-products">
                <i class="fa-solid fa-box-open"></i>
                <h3>لم يتم العثور على أي منتجات مطابقة في رونق!</h3>
                <p>يرجى تجربة معايير بحث أو تصفية مختلفة.</p>
                <button class="btn-primary" onclick="resetAllFilters()">إعادة ضبط الفلاتر</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(product => {
        const isWishlisted = AppState.wishlist.includes(product.id);
        const inCartItem = AppState.cart.find(item => item.id === product.id);
        
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image-box">
                    <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'">
                    ${product.badge ? `<span class="product-badge ${product.badgeType || 'hot'}">${product.badge}</span>` : ''}
                    
                    <div class="product-actions-overlay">
                        <button class="card-action-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id})" title="إضافة للمفضلة">
                            <i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>
                        </button>
                        <button class="card-action-btn" onclick="openQuickView(${product.id})" title="عرض سريع">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    </div>
                </div>

                <div class="product-details">
                    <span class="product-category">${getCategoryName(product.category)}</span>
                    <h3 class="product-name" onclick="openQuickView(${product.id})">${product.name}</h3>
                    
                    <div class="product-rating">
                        <div class="stars">${renderStars(product.rating || 5)}</div>
                        <span class="reviews-count">(${product.reviewsCount || 10})</span>
                    </div>

                    <div class="product-price-box">
                        <span class="current-price">${product.price.toLocaleString()} ر.ي</span>
                        ${product.originalPrice ? `<span class="original-price">${product.originalPrice.toLocaleString()} ر.ي</span>` : ''}
                    </div>

                    <button class="add-to-cart-btn ${inCartItem ? 'in-cart' : ''}" onclick="addToCart(${product.id})">
                        <i class="fa-solid ${inCartItem ? 'fa-check' : 'fa-cart-shopping'}"></i>
                        <span>${inCartItem ? `في السلة (${inCartItem.quantity})` : 'أضف للسلة'}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fa-solid fa-star"></i>';
    }
    if (hasHalf) {
        stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="fa-regular fa-star"></i>';
    }
    return stars;
}

function getCategoryName(catId) {
    const categories = getStoreCategories();
    const found = categories.find(c => c.id === catId);
    return found ? found.name : 'منتج فاخر';
}

function resetAllFilters() {
    AppState.filters = {
        category: 'all',
        maxPrice: 400000,
        minRating: 0,
        inStockOnly: false,
        searchQuery: '',
        sortBy: 'featured'
    };

    const priceRange = document.getElementById('priceRange');
    if (priceRange) priceRange.value = 400000;
    const priceDisplay = document.getElementById('maxPriceDisplay');
    if (priceDisplay) priceDisplay.innerText = '400,000 ر.ي';

    const stockCheck = document.getElementById('inStockOnly');
    if (stockCheck) stockCheck.checked = false;

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'featured';

    const searchInput = document.getElementById('headerSearchInput');
    if (searchInput) searchInput.value = '';

    const allCatRadio = document.querySelector('input[name="categoryFilter"][value="all"]');
    if (allCatRadio) allCatRadio.checked = true;

    renderCategories();
    renderProducts();
    showToast('تمت إعادة ضبط جميع الفلاتر', 'info', 'fa-arrows-rotate');
}

// ==========================================
// إدارة سلة المشتريات (Shopping Cart Engine)
// ==========================================
function addToCart(productId, quantity = 1, selectedColor = null) {
    const allProducts = getStoreProducts();
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = AppState.cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        AppState.cart[existingIndex].quantity += quantity;
    } else {
        AppState.cart.push({
            id: productId,
            quantity: quantity,
            color: selectedColor || (product.colorNames ? product.colorNames[0] : null)
        });
    }

    saveCart();
    updateCartUI();
    renderProducts();
    showToast(`تمت إضافة "${product.name.substring(0, 25)}..." إلى السلة`, 'success', 'fa-cart-plus');
}

function updateQuantity(productId, delta) {
    const item = AppState.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCartUI();
    renderProducts();
}

function removeFromCart(productId) {
    AppState.cart = AppState.cart.filter(i => i.id !== productId);
    saveCart();
    updateCartUI();
    renderProducts();
    showToast('تم حذف المنتج من السلة', 'info', 'fa-trash-can');
}

function saveCart() {
    localStorage.setItem('rawnaq_yemen_cart', JSON.stringify(AppState.cart));
}

function updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const container = document.getElementById('cartItemsContainer');
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountRow = document.getElementById('cartDiscountRow');
    const discountEl = document.getElementById('cartDiscount');
    const totalEl = document.getElementById('cartTotal');
    const progressFill = document.getElementById('shippingProgressFill');
    const progressText = document.getElementById('shippingProgressText');

    const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) badge.innerText = totalCount;

    if (!container) return;

    const allProducts = getStoreProducts();

    if (AppState.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-products" style="border: none; padding: 3rem 1rem;">
                <i class="fa-solid fa-cart-shopping" style="font-size: 3rem; color: var(--brand-primary);"></i>
                <h3>سلة رونق فارغة</h3>
                <p>تصفح أحدث المنتجات الفاخرة وأضفها لسلتك الآن!</p>
            </div>
        `;
        if (subtotalEl) subtotalEl.innerText = '0 ر.ي';
        if (totalEl) totalEl.innerText = '0 ر.ي';
        if (discountRow) discountRow.style.display = 'none';
        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.innerText = `أضف بقيمة ${FREE_SHIPPING_THRESHOLD.toLocaleString()} ر.ي للحصول على شحن مجاني!`;
        return;
    }

    let subtotal = 0;
    const itemsHtml = AppState.cart.map(item => {
        const product = allProducts.find(p => p.id === item.id);
        if (!product) return '';
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        return `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${product.name}</h4>
                    ${item.color ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">اللون: ${item.color}</p>` : ''}
                    <div class="cart-item-price">${(product.price * item.quantity).toLocaleString()} ر.ي</div>
                    <div class="cart-item-actions">
                        <div class="qty-counter">
                            <button class="qty-btn" onclick="updateQuantity(${product.id}, -1)">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${product.id}, 1)">+</button>
                        </div>
                        <button class="remove-item-btn" onclick="removeFromCart(${product.id})" title="حذف">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = itemsHtml;

    let discount = 0;
    if (AppState.appliedCoupon) {
        discount = subtotal * AppState.appliedCoupon.discount;
        if (discountRow) {
            discountRow.style.display = 'flex';
            if (discountEl) discountEl.innerText = `- ${discount.toLocaleString()} ر.ي`;
        }
    } else {
        if (discountRow) discountRow.style.display = 'none';
    }

    const finalTotal = subtotal - discount;

    if (subtotalEl) subtotalEl.innerText = `${subtotal.toLocaleString()} ر.ي`;
    if (totalEl) totalEl.innerText = `${finalTotal.toLocaleString()} ر.ي`;

    const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
    const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
    
    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (progressText) {
        if (remainingForFreeShipping <= 0) {
            progressText.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--brand-secondary);"></i> مبارك! حصلت على <strong>شحن مجاني</strong> لطلبك';
        } else {
            progressText.innerHTML = `<i class="fa-solid fa-truck-fast"></i> أضف بقيمة <strong>${remainingForFreeShipping.toLocaleString()} ر.ي</strong> للحصول على شحن مجاني`;
        }
    }
}

function applyCouponCode() {
    const input = document.getElementById('couponInput');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        showToast('يرجى إدخال رمز الكوبون', 'error', 'fa-circle-exclamation');
        return;
    }

    const coupons = getStoreCoupons();
    if (coupons[code]) {
        AppState.appliedCoupon = coupons[code];
        updateCartUI();
        showToast(`تم تطبيق ${coupons[code].desc} بنجاح!`, 'success', 'fa-tag');
    } else {
        showToast('رمز الكوبون غير صالح أو منتهي الصلاحية', 'error', 'fa-triangle-exclamation');
    }
}

function toggleCartDrawer(open = null) {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (!drawer || !overlay) return;

    const shouldOpen = open !== null ? open : !drawer.classList.contains('active');
    if (shouldOpen) {
        drawer.classList.add('active');
        overlay.classList.add('active');
    } else {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// ==========================================
// المفضلة (Wishlist Engine)
// ==========================================
function toggleWishlist(productId) {
    const index = AppState.wishlist.indexOf(productId);
    const allProducts = getStoreProducts();
    const product = allProducts.find(p => p.id === productId);

    if (index > -1) {
        AppState.wishlist.splice(index, 1);
        showToast(`تم حذف "${product ? product.name.substring(0, 20) : ''}..." من المفضلة`, 'info', 'fa-heart-crack');
    } else {
        AppState.wishlist.push(productId);
        showToast(`تمت إضافة "${product ? product.name.substring(0, 20) : ''}..." إلى المفضلة`, 'success', 'fa-heart');
    }

    localStorage.setItem('rawnaq_yemen_wishlist', JSON.stringify(AppState.wishlist));
    updateWishlistBadge();
    renderProducts();
}

function updateWishlistBadge() {
    const badge = document.getElementById('wishlistBadge');
    if (badge) badge.innerText = AppState.wishlist.length;
}

// ==========================================
// نافذة العرض السريع (Quick View Modal)
// ==========================================
function openQuickView(productId) {
    const allProducts = getStoreProducts();
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    AppState.quickViewProduct = product;
    AppState.selectedQuickViewColor = product.colorNames ? product.colorNames[0] : null;

    const overlay = document.getElementById('quickViewOverlay');
    const container = document.getElementById('quickViewContent');

    if (!overlay || !container) return;

    const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

    container.innerHTML = `
        <div class="quickview-grid">
            <div class="quickview-gallery">
                <img src="${gallery[0]}" alt="${product.name}" class="quickview-main-img" id="quickViewMainImg" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'">
                <div class="quickview-thumbs">
                    ${gallery.map((img, idx) => `
                        <img src="${img}" class="quickview-thumb ${idx === 0 ? 'active' : ''}" onclick="switchQuickViewImage('${img}', this)" alt="صورة ${idx + 1}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'">
                    `).join('')}
                </div>
            </div>

            <div class="quickview-info">
                <span class="product-category">${getCategoryName(product.category)}</span>
                <h2>${product.name}</h2>
                
                <div class="product-rating" style="margin-bottom: 1rem;">
                    <div class="stars">${renderStars(product.rating || 5)}</div>
                    <span class="reviews-count">(${product.reviewsCount || 12} تقييم حقيقي)</span>
                </div>

                <div class="product-price-box" style="margin-bottom: 1.25rem;">
                    <span class="current-price" style="font-size: 1.6rem; color: var(--brand-primary);">${product.price.toLocaleString()} ر.ي</span>
                    ${product.originalPrice ? `<span class="original-price" style="font-size: 1.1rem;">${product.originalPrice.toLocaleString()} ر.ي</span>` : ''}
                </div>

                <p class="quickview-desc">${product.description || 'منتج فاخر بأعلى معايير الجودة والمواصفات العالمية من متجر رونق اليمن.'}</p>

                ${product.features && product.features.length > 0 ? `
                    <ul class="quickview-features">
                        ${product.features.map(f => `<li><i class="fa-solid fa-check-circle"></i> ${f}</li>`).join('')}
                    </ul>
                ` : ''}

                ${product.colors && product.colors.length > 0 ? `
                    <div class="color-options">
                        <div class="color-options-title">اللون المتاح: <span id="selectedColorName">${AppState.selectedQuickViewColor}</span></div>
                        <div class="color-dots">
                            ${product.colors.map((color, idx) => `
                                <div class="color-dot ${idx === 0 ? 'active' : ''}" style="background-color: ${color};" onclick="selectQuickViewColor('${product.colorNames ? product.colorNames[idx] : 'افتراضي'}', this)"></div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1.75rem;">
                    <button class="btn-primary" style="flex: 1;" onclick="addQuickViewToCart()">
                        <i class="fa-solid fa-cart-shopping"></i> أضف إلى السلة
                    </button>
                    <button class="btn-outline" style="border-color: var(--border-color); color: var(--text-primary);" onclick="toggleWishlist(${product.id})">
                        <i class="fa-${AppState.wishlist.includes(product.id) ? 'solid' : 'regular'} fa-heart" style="color: #f43f5e;"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    overlay.classList.add('active');
}

function switchQuickViewImage(src, thumbEl) {
    const mainImg = document.getElementById('quickViewMainImg');
    if (mainImg) mainImg.src = src;

    document.querySelectorAll('.quickview-thumb').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
}

function selectQuickViewColor(colorName, dotEl) {
    AppState.selectedQuickViewColor = colorName;
    const nameEl = document.getElementById('selectedColorName');
    if (nameEl) nameEl.innerText = colorName;

    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    if (dotEl) dotEl.classList.add('active');
}

function addQuickViewToCart() {
    if (!AppState.quickViewProduct) return;
    addToCart(AppState.quickViewProduct.id, 1, AppState.selectedQuickViewColor);
    closeQuickView();
    toggleCartDrawer(true);
}

function closeQuickView() {
    const overlay = document.getElementById('quickViewOverlay');
    if (overlay) overlay.classList.remove('active');
}

// ==========================================
// نافذة إتمام الطلب (Checkout Flow)
// ==========================================
function openCheckoutModal() {
    if (AppState.cart.length === 0) {
        showToast('السلة فارغة، يرجى إضافة منتجات أولاً', 'error', 'fa-cart-shopping');
        return;
    }

    toggleCartDrawer(false);

    const overlay = document.getElementById('checkoutOverlay');
    const summaryItems = document.getElementById('checkoutSummaryItems');
    const couponInput = document.getElementById('checkoutCouponInput');
    const couponMsg = document.getElementById('checkoutCouponMsg');

    if (!overlay) return;

    const allProducts = getStoreProducts();
    if (summaryItems) {
        summaryItems.innerHTML = AppState.cart.map(item => {
            const product = allProducts.find(p => p.id === item.id);
            if (!product) return '';
            const total = product.price * item.quantity;

            return `
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem;">
                    <span>${product.name.substring(0, 22)}... × ${item.quantity}</span>
                    <strong style="color: var(--brand-primary);">${total.toLocaleString()} ر.ي</strong>
                </div>
            `;
        }).join('');
    }

    if (AppState.appliedCoupon && couponInput) {
        const coupons = getStoreCoupons();
        const foundCode = Object.keys(coupons).find(k => coupons[k].discount === AppState.appliedCoupon.discount);
        if (foundCode) couponInput.value = foundCode;
        if (couponMsg) {
            couponMsg.style.display = 'block';
            couponMsg.style.color = 'var(--brand-secondary)';
            couponMsg.innerHTML = `<i class="fa-solid fa-check"></i> ${AppState.appliedCoupon.desc}`;
        }
    } else {
        if (couponInput) couponInput.value = '';
        if (couponMsg) couponMsg.style.display = 'none';
    }

    updateCheckoutTotals();
    overlay.classList.add('active');
}

function updateCheckoutTotals() {
    const allProducts = getStoreProducts();
    let subtotal = 0;
    AppState.cart.forEach(item => {
        const product = allProducts.find(p => p.id === item.id);
        if (product) subtotal += product.price * item.quantity;
    });

    let discount = 0;
    const discountRow = document.getElementById('checkoutDiscountRow');
    const discountEl = document.getElementById('checkoutDiscount');

    if (AppState.appliedCoupon) {
        discount = subtotal * AppState.appliedCoupon.discount;
        if (discountRow) {
            discountRow.style.display = 'flex';
            if (discountEl) discountEl.innerText = `- ${discount.toLocaleString()} ر.ي`;
        }
    } else {
        if (discountRow) discountRow.style.display = 'none';
    }

    const finalTotal = subtotal - discount;

    const subtotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');

    if (subtotalEl) subtotalEl.innerText = `${subtotal.toLocaleString()} ر.ي`;
    if (totalEl) totalEl.innerText = `${finalTotal.toLocaleString()} ر.ي`;
}

function applyCheckoutCouponCode() {
    const input = document.getElementById('checkoutCouponInput');
    const msgEl = document.getElementById('checkoutCouponMsg');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        if (msgEl) {
            msgEl.style.display = 'block';
            msgEl.style.color = '#f43f5e';
            msgEl.innerText = 'يرجى إدخال رمز الكوبون أولاً';
        }
        showToast('يرجى إدخال رمز الكوبون', 'error', 'fa-circle-exclamation');
        return;
    }

    const coupons = getStoreCoupons();
    if (coupons[code]) {
        AppState.appliedCoupon = coupons[code];
        updateCheckoutTotals();
        updateCartUI();
        if (msgEl) {
            msgEl.style.display = 'block';
            msgEl.style.color = 'var(--brand-secondary)';
            msgEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> تم تطبيق ${coupons[code].desc}!`;
        }
        showToast(`تم تطبيق ${coupons[code].desc} بنجاح!`, 'success', 'fa-tag');
    } else {
        if (msgEl) {
            msgEl.style.display = 'block';
            msgEl.style.color = '#f43f5e';
            msgEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> رمز الكوبون غير صالح أو منتهي';
        }
        showToast('رمز الكوبون غير صالح أو منتهي الصلاحية', 'error', 'fa-triangle-exclamation');
    }
}

function closeCheckoutModal() {
    const overlay = document.getElementById('checkoutOverlay');
    if (overlay) overlay.classList.remove('active');
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const cityInput = document.getElementById('customerCity');
    const addressInput = document.getElementById('customerAddress');
    const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');

    if (!nameInput.value || !phoneInput.value || !cityInput.value) {
        showToast('يرجى تعبئة جميع الحقول المطلوبة', 'error', 'fa-triangle-exclamation');
        return;
    }

    // التحقق من رقم الهاتف اليمني (يبدأ بـ 7 أو 01 أو 967)
    const phoneVal = phoneInput.value.replace(/[\s-]/g, '');
    if (!/^((\+?967)|0)?[71-8][0-9]{7,8}$/.test(phoneVal) && phoneVal.length < 7) {
        showToast('يرجى إدخال رقم هاتف يمني صحيح (مثال: 771234567)', 'error', 'fa-phone');
        return;
    }

    const allProducts = getStoreProducts();
    let subtotal = 0;
    const orderItems = AppState.cart.map(item => {
        const prod = allProducts.find(p => p.id === item.id);
        const itemTotal = prod ? prod.price * item.quantity : 0;
        subtotal += itemTotal;
        return {
            id: item.id,
            name: prod ? prod.name : 'منتج',
            quantity: item.quantity,
            price: prod ? prod.price : 0,
            color: item.color
        };
    });

    let discount = 0;
    if (AppState.appliedCoupon) {
        discount = subtotal * AppState.appliedCoupon.discount;
    }
    const finalTotal = subtotal - discount;

    const orderId = 'RNQ-YE-' + Math.floor(100000 + Math.random() * 900000);
    
    const paymentMethodMap = {
        'unified_network': 'حوالة عبر الشبكة الموحدة فقط (UNS)',
        'kuraimi': 'الكريمي (حاسب / إم فلوس)',
        'wallets': 'محفظة ون كاش / فلوسك / جوالي',
        'cod': 'الدفع كاش عند الاستلام'
    };

    const newOrder = {
        id: orderId,
        customerName: nameInput.value,
        customerPhone: phoneInput.value,
        customerCity: cityInput.options[cityInput.selectedIndex].text,
        customerAddress: addressInput ? addressInput.value : '',
        paymentMethod: paymentRadio ? (paymentMethodMap[paymentRadio.value] || paymentRadio.value) : 'كاش عند الاستلام',
        items: orderItems,
        subtotal: subtotal,
        discount: discount,
        total: finalTotal,
        status: 'pending',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    addStoreOrder(newOrder);

    closeCheckoutModal();
    
    const successOverlay = document.getElementById('orderSuccessOverlay');
    const orderIdEl = document.getElementById('confirmedOrderId');
    if (orderIdEl) orderIdEl.innerText = orderId;
    if (successOverlay) successOverlay.classList.add('active');

    AppState.cart = [];
    AppState.appliedCoupon = null;
    saveCart();
    updateCartUI();
    renderProducts();

    showToast('تم استلام طلبك بنجاح! سيتم التواصل بك لتأكيد الشحن لمدينتك', 'success', 'fa-circle-check');
}

function closeSuccessModal() {
    const successOverlay = document.getElementById('orderSuccessOverlay');
    if (successOverlay) successOverlay.classList.remove('active');
}

// ==========================================
// عداد العروض التنازلي (Flash Sale Countdown)
// ==========================================
function initFlashSaleCountdown() {
    let duration = (14 * 3600) + (45 * 60) + 20;

    const hoursEl = document.getElementById('flashHours');
    const minsEl = document.getElementById('flashMinutes');
    const secsEl = document.getElementById('flashSeconds');

    setInterval(() => {
        if (duration <= 0) duration = 24 * 3600;
        duration--;

        const h = Math.floor(duration / 3600);
        const m = Math.floor((duration % 3600) / 60);
        const s = duration % 60;

        if (hoursEl) hoursEl.innerText = String(h).padStart(2, '0');
        if (minsEl) minsEl.innerText = String(m).padStart(2, '0');
        if (secsEl) secsEl.innerText = String(s).padStart(2, '0');
    }, 1000);
}

// ==========================================
// البحث الفوري التفاعلي (Instant Search)
// ==========================================
function initSearch() {
    const input = document.getElementById('headerSearchInput');
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        AppState.filters.searchQuery = query;

        if (query.length === 0) {
            dropdown.classList.remove('active');
            renderProducts();
            return;
        }

        const allProducts = getStoreProducts();
        const matches = allProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.description || '').toLowerCase().includes(query) ||
            getCategoryName(p.category).toLowerCase().includes(query)
        ).slice(0, 5);

        if (matches.length > 0) {
            dropdown.innerHTML = matches.map(p => `
                <div class="search-item" onclick="openQuickView(${p.id})">
                    <img src="${p.image}" class="search-item-img" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'">
                    <div class="search-item-info">
                        <div class="search-item-name">${p.name}</div>
                        <div class="search-item-price">${p.price.toLocaleString()} ر.ي</div>
                    </div>
                </div>
            `).join('');
            dropdown.classList.add('active');
        } else {
            dropdown.innerHTML = `
                <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                    لا توجد منتجات مطابقة لـ "${query}" في رونق اليمن
                </div>
            `;
            dropdown.classList.add('active');
        }

        renderProducts();
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

// ==========================================
// إعداد مستمعي الأحداث (Event Listeners)
// ==========================================
function initEventListeners() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const openCartBtn = document.getElementById('openCartBtn');
    if (openCartBtn) openCartBtn.addEventListener('click', () => toggleCartDrawer(true));

    const closeCartBtn = document.getElementById('closeCartBtn');
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCartDrawer(false));

    const drawerOverlay = document.getElementById('drawerOverlay');
    if (drawerOverlay) drawerOverlay.addEventListener('click', () => toggleCartDrawer(false));

    const priceRange = document.getElementById('priceRange');
    const priceDisplay = document.getElementById('maxPriceDisplay');
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            AppState.filters.maxPrice = Number(e.target.value);
            if (priceDisplay) priceDisplay.innerText = `${AppState.filters.maxPrice.toLocaleString()} ر.ي`;
            renderProducts();
        });
    }

    const inStockOnly = document.getElementById('inStockOnly');
    if (inStockOnly) {
        inStockOnly.addEventListener('change', (e) => {
            AppState.filters.inStockOnly = e.target.checked;
            renderProducts();
        });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            AppState.filters.sortBy = e.target.value;
            renderProducts();
        });
    }

    document.querySelectorAll('input[name="categoryFilter"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectCategory(e.target.value);
        });
    });

    initSearch();

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletterEmail').value;
            if (email) {
                showToast('شكرًا لاشتراكك في نادي رونق اليمن VIP! تم إرسال كود الهدية لبريدك', 'success', 'fa-envelope-open-text');
                newsletterForm.reset();
            }
        });
    }
}

// ==========================================
// محرك الإشعارات اللحظية (Toast Engine)
// ==========================================
function showToast(message, type = 'info', icon = 'fa-info-circle') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
