/**
 * متجر رونق اليمن الفاخر (Rawnaq Yemen Store) - المنطق البرمجي والتفاعلي الشامل
 * يتضمن: تتبع الشحنات، الطلب المباشر عبر واتساب، طباعة الفواتير، وحوالة الشبكة الموحدة
 */

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

const STORE_WHATSAPP_NUMBER = "967777123456"; // رقم خدمة عملاء واتساب متجر رونق
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
            <div class="empty-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                <i class="fa-solid fa-box-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>لم يتم العثور على أي منتجات مطابقة في رونق!</h3>
                <p style="color: var(--text-muted); margin-bottom: 1rem;">يرجى تجربة معايير بحث أو تصفية مختلفة.</p>
                <button class="btn-primary" onclick="resetAllFilters()">إعادة ضبط الفلاتر</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(product => {
        const isWishlisted = AppState.wishlist.includes(product.id);
        const inCartItem = AppState.cart.find(item => item.id === product.id);
        const isLowStock = product.inStock && product.stockCount && product.stockCount <= 5;
        
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

                    ${isLowStock ? `<div class="stock-scarcity-pill"><i class="fa-solid fa-fire"></i> متبقي ${product.stockCount} قطع فقط بالمخزون!</div>` : ''}

                    <div class="product-price-box">
                        <span class="current-price">${product.price.toLocaleString()} ر.ي</span>
                        ${product.originalPrice ? `<span class="original-price">${product.originalPrice.toLocaleString()} ر.ي</span>` : ''}
                    </div>

                    <div class="card-bottom-actions">
                        <button class="add-to-cart-btn ${inCartItem ? 'in-cart' : ''}" onclick="addToCart(${product.id})">
                            <i class="fa-solid ${inCartItem ? 'fa-check' : 'fa-cart-shopping'}"></i>
                            <span>${inCartItem ? `في السلة (${inCartItem.quantity})` : 'أضف للسلة'}</span>
                        </button>
                        <button class="btn-whatsapp-direct" onclick="orderProductViaWhatsApp(${product.id})" title="طلب فوري عبر واتساب">
                            <i class="fa-brands fa-whatsapp" style="font-size: 1.1rem;"></i>
                        </button>
                    </div>
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
            <div class="empty-products" style="border: none; padding: 3rem 1rem; text-align: center;">
                <i class="fa-solid fa-cart-shopping" style="font-size: 3rem; color: var(--brand-primary); margin-bottom: 1rem;"></i>
                <h3>سلة رونق فارغة</h3>
                <p style="color: var(--text-muted);">تصفح أحدث المنتجات الفاخرة وأضفها لسلتك الآن!</p>
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
            progressText.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--brand-success);"></i> مبارك! حصلت على <strong>شحن مجاني</strong> لطلبك';
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
// الطلب المباشر بنقرة واحدة عبر واتساب (1-Click WhatsApp Order)
// ==========================================
function orderProductViaWhatsApp(productId) {
    const allProducts = getStoreProducts();
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const message = `مرحباً متجر رونق اليمن 💎%0Aأرغب في طلب المنتج التالي:%0A🛍️ *${product.name}*%0A💰 السعر: *${product.price.toLocaleString()} ر.ي*%0A🔗 الرابط: ${window.location.origin + window.location.pathname}%0A%0Aيرجى إفادتي بتفاصيل الشحن والتوصيل.`;
    const waUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${message}`;
    window.open(waUrl, '_blank');
}

function sendCartViaWhatsApp() {
    if (AppState.cart.length === 0) {
        showToast('السلة فارغة، يرجى إضافة منتجات أولاً', 'error', 'fa-cart-shopping');
        return;
    }

    const allProducts = getStoreProducts();
    let itemsText = '';
    let subtotal = 0;

    AppState.cart.forEach((item, index) => {
        const prod = allProducts.find(p => p.id === item.id);
        if (prod) {
            const itemTotal = prod.price * item.quantity;
            subtotal += itemTotal;
            itemsText += `${index + 1}. *${prod.name}* (الكمية: ${item.quantity}) - ${itemTotal.toLocaleString()} ر.ي%0A`;
        }
    });

    let discount = AppState.appliedCoupon ? (subtotal * AppState.appliedCoupon.discount) : 0;
    let finalTotal = subtotal - discount;

    const message = `مرحباً متجر رونق اليمن 💎%0Aأرغب في إتمام طلب محتويات السلة:%0A%0A${itemsText}%0A💵 *المجموع الإجمالي: ${finalTotal.toLocaleString()} ر.ي*%0A%0Aيرجى تأكيد استلام الطلب وتزويدي بحساب حوالة الشبكة الموحدة أو التوصيل.`;
    const waUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${message}`;
    window.open(waUrl, '_blank');
}

// ==========================================
// تتبع الطلبات والشحنات (Order Tracking System)
// ==========================================
function handleTrackOrderSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('trackingOrderInput');
    if (!input) return;

    const orderId = input.value.trim().toUpperCase();
    if (!orderId) {
        showToast('يرجى إدخال رقم الطلب للبحث', 'error', 'fa-magnifying-glass');
        return;
    }

    const orders = getStoreOrders();
    const order = orders.find(o => o.id.toUpperCase() === orderId || o.id.replace('RNQ-YE-', '').toUpperCase() === orderId);

    const resultBox = document.getElementById('trackingResultBox');
    if (!resultBox) return;

    if (!order) {
        resultBox.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #f43f5e; background: rgba(244, 63, 94, 0.08); border-radius: var(--radius-lg); border: 1px solid rgba(244,63,94,0.2);">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                <h4>لم يتم العثور على طلب بالرقم "${orderId}"</h4>
                <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.25rem;">يرجى التأكد من كتابة رقم الطلب كما هو موضح في رسالة التأكيد (مثال: RNQ-YE-89241)</p>
            </div>
        `;
        resultBox.style.display = 'block';
        return;
    }

    // حساب الخطوة الحالية
    const statusSteps = ['pending', 'processing', 'shipped', 'completed'];
    const currentStatus = order.status || 'pending';
    let stepIndex = statusSteps.indexOf(currentStatus);
    if (stepIndex === -1 && currentStatus === 'cancelled') stepIndex = -1;

    let progressPercent = 15;
    if (stepIndex === 1) progressPercent = 45;
    if (stepIndex === 2) progressPercent = 75;
    if (stepIndex === 3) progressPercent = 100;

    resultBox.innerHTML = `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.75rem; box-shadow: var(--shadow-md);">
            
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                <div>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">رقم الشحنة:</span>
                    <h3 style="color: var(--brand-primary); font-family: var(--font-heading); font-size: 1.3rem;">${order.id}</h3>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">العميل: <strong>${order.customerName}</strong> (${order.customerCity})</div>
                </div>
                <div style="text-align: left;">
                    <button class="btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.82rem;" onclick="openInvoiceModal('${order.id}')">
                        <i class="fa-solid fa-print"></i> عرض الفاتورة وسند الاستلام
                    </button>
                </div>
            </div>

            <!-- شريط الخطوات التفاعلي -->
            <div class="tracking-timeline">
                <div class="tracking-progress-line" style="width: ${progressPercent}%;"></div>

                <div class="tracking-step ${stepIndex >= 0 ? 'completed' : ''} ${stepIndex === 0 ? 'active' : ''}">
                    <div class="step-icon-box"><i class="fa-solid fa-receipt"></i></div>
                    <div class="step-title">تم استلام الطلب</div>
                    <div class="step-time">${order.date ? order.date.substring(5, 16) : 'مكتمل'}</div>
                </div>

                <div class="tracking-step ${stepIndex >= 1 ? 'completed' : ''} ${stepIndex === 1 ? 'active' : ''}">
                    <div class="step-icon-box"><i class="fa-solid fa-box-open"></i></div>
                    <div class="step-title">قيد التجهيز والتغليف</div>
                    <div class="step-time">${stepIndex >= 1 ? 'تم التجهيز' : 'قريباً'}</div>
                </div>

                <div class="tracking-step ${stepIndex >= 2 ? 'completed' : ''} ${stepIndex === 2 ? 'active' : ''}">
                    <div class="step-icon-box"><i class="fa-solid fa-truck-fast"></i></div>
                    <div class="step-title">خرج مع المندوب للشحن</div>
                    <div class="step-time">${stepIndex >= 2 ? 'جاري التوصيل' : 'بانتظار الشحن'}</div>
                </div>

                <div class="tracking-step ${stepIndex >= 3 ? 'completed' : ''} ${stepIndex === 3 ? 'active' : ''}">
                    <div class="step-icon-box"><i class="fa-solid fa-circle-check"></i></div>
                    <div class="step-title">تم التسليم بنجاح</div>
                    <div class="step-time">${stepIndex >= 3 ? 'مستلم' : 'عند الوصول'}</div>
                </div>
            </div>

            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                    <i class="fa-solid fa-location-dot" style="color: var(--brand-primary);"></i>
                    عنوان التوصيل: <strong>${order.customerCity} - ${order.customerAddress || 'الشارع العام'}</strong>
                </div>
                <div>
                    طريقة الدفع: <strong>${order.paymentMethod}</strong>
                    ${order.voucherNumber ? `<span style="background: var(--brand-primary-light); color: var(--brand-primary); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-right: 0.4rem;">سند: ${order.voucherNumber}</span>` : ''}
                </div>
            </div>

        </div>
    `;

    resultBox.style.display = 'block';
    showToast(`تم عرض بيانات تتبع الطلب ${order.id}`, 'info', 'fa-truck-fast');
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

    // منتجات مشابهة مقترحة
    const relatedProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 3);

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
                
                <div class="product-rating" style="margin-bottom: 0.75rem;">
                    <div class="stars">${renderStars(product.rating || 5)}</div>
                    <span class="reviews-count">(${product.reviewsCount || 12} تقييم حقيقي من اليمن)</span>
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
                    <div class="color-options" style="margin-top: 1rem;">
                        <div class="color-options-title" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">اللون المتاح: <span id="selectedColorName" style="color: var(--brand-primary);">${AppState.selectedQuickViewColor}</span></div>
                        <div class="color-dots" style="display: flex; gap: 0.5rem;">
                            ${product.colors.map((color, idx) => `
                                <div class="color-dot ${idx === 0 ? 'active' : ''}" style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; border: 2px solid var(--border-color);" onclick="selectQuickViewColor('${product.colorNames ? product.colorNames[idx] : 'افتراضي'}', this)"></div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 0.75rem; align-items: center; margin-top: 1.5rem; flex-wrap: wrap;">
                    <button class="btn-primary" style="flex: 1;" onclick="addQuickViewToCart()">
                        <i class="fa-solid fa-cart-shopping"></i> أضف إلى السلة
                    </button>
                    <button class="btn-whatsapp-direct" style="padding: 0.75rem 1.25rem;" onclick="orderProductViaWhatsApp(${product.id})">
                        <i class="fa-brands fa-whatsapp"></i> طلب بالواتساب
                    </button>
                    <button class="btn-outline" style="border-color: var(--border-color); color: var(--text-primary); padding: 0.75rem;" onclick="toggleWishlist(${product.id})">
                        <i class="fa-${AppState.wishlist.includes(product.id) ? 'solid' : 'regular'} fa-heart" style="color: #f43f5e;"></i>
                    </button>
                </div>
            </div>
        </div>

        ${relatedProducts.length > 0 ? `
            <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
                <h4 style="font-size: 1.1rem; margin-bottom: 1rem;">منتجات مشابهة قد تعجبك:</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                    ${relatedProducts.map(rp => `
                        <div style="display: flex; gap: 0.75rem; align-items: center; background: var(--bg-secondary); padding: 0.6rem; border-radius: var(--radius-md); cursor: pointer;" onclick="openQuickView(${rp.id})">
                            <img src="${rp.image}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
                            <div>
                                <div style="font-size: 0.85rem; font-weight: 700; line-height: 1.2;">${rp.name.substring(0, 20)}...</div>
                                <div style="font-size: 0.8rem; color: var(--brand-primary); font-weight: 800;">${rp.price.toLocaleString()} ر.ي</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
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
            couponMsg.style.color = 'var(--brand-success)';
            couponMsg.innerHTML = `<i class="fa-solid fa-check"></i> ${AppState.appliedCoupon.desc}`;
        }
    } else {
        if (couponInput) couponInput.value = '';
        if (couponMsg) couponMsg.style.display = 'none';
    }

    updateCheckoutTotals();
    handlePaymentMethodChange();
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
            msgEl.style.color = 'var(--brand-success)';
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

function handlePaymentMethodChange() {
    const selectedRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const unsBox = document.getElementById('unsInstructionsBox');
    if (!selectedRadio || !unsBox) return;

    if (selectedRadio.value === 'unified_network') {
        unsBox.style.display = 'block';
    } else {
        unsBox.style.display = 'none';
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
    const voucherInput = document.getElementById('unsVoucherNumber');
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
        voucherNumber: (paymentRadio && paymentRadio.value === 'unified_network' && voucherInput) ? voucherInput.value.trim() : null,
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
    const invoiceBtn = document.getElementById('successInvoiceBtn');
    
    if (orderIdEl) orderIdEl.innerText = orderId;
    if (invoiceBtn) invoiceBtn.setAttribute('onclick', `openInvoiceModal('${orderId}')`);
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
// طباعة الفاتورة وسند الاستلام (Invoice Generator)
// ==========================================
function openInvoiceModal(orderId) {
    const orders = getStoreOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const overlay = document.getElementById('invoiceModalOverlay');
    const content = document.getElementById('invoiceContent');
    if (!overlay || !content) return;

    content.innerHTML = `
        <div class="invoice-card" id="printableInvoiceArea">
            <div class="invoice-header">
                <div>
                    <h2 style="color: var(--brand-primary); font-size: 1.6rem; font-family: var(--font-heading);">رَوْنَـقْ ✦ RAWNAQ YEMEN</h2>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">فاتورة وسند استلام طلب إلكتروني معتمد</p>
                    <p style="font-size: 0.82rem; color: var(--text-muted);">الجمهورية اليمنية - صنعاء / عدن</p>
                </div>
                <div style="text-align: left;">
                    <div style="font-size: 1.1rem; font-weight: 900; color: var(--brand-primary);">${order.id}</div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">التاريخ: ${order.date || 'اليوم'}</div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">الحالة: <span class="status-pill ${order.status}">${order.status === 'completed' ? 'تم التسليم' : 'قيد المعالجة'}</span></div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; background: #f8fafc; padding: 1rem; border-radius: var(--radius-md);">
                <div>
                    <strong>بيانات العميل:</strong>
                    <div style="font-size: 0.9rem; margin-top: 0.2rem;">الاسم: <strong>${order.customerName}</strong></div>
                    <div style="font-size: 0.9rem;">الهاتف: <span style="direction: ltr; display: inline-block;">${order.customerPhone}</span></div>
                </div>
                <div>
                    <strong>وجهة الشحن والتسليم:</strong>
                    <div style="font-size: 0.9rem; margin-top: 0.2rem;">المحافظة: <strong>${order.customerCity}</strong></div>
                    <div style="font-size: 0.9rem;">العنوان: ${order.customerAddress || 'الشارع العام'}</div>
                    <div style="font-size: 0.9rem;">طريقة الدفع: <strong>${order.paymentMethod}</strong></div>
                    ${order.voucherNumber ? `<div style="font-size: 0.85rem; color: var(--brand-primary);">رقم سند الحوالة: <strong>${order.voucherNumber}</strong></div>` : ''}
                </div>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>المنتج والمواصفات</th>
                        <th>الكمية</th>
                        <th>السعر الفردي</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${(order.items || []).map((item, idx) => `
                        <tr>
                            <td>${idx + 1}</td>
                            <td><strong>${item.name}</strong> ${item.color ? `<span style="font-size: 0.78rem; color: #64748b;">(اللون: ${item.color})</span>` : ''}</td>
                            <td>${item.quantity}</td>
                            <td>${(item.price || 0).toLocaleString()} ر.ي</td>
                            <td><strong>${((item.price || 0) * item.quantity).toLocaleString()} ر.ي</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.5rem; border-top: 2px solid #e2e8f0; padding-top: 1rem;">
                <div style="font-size: 0.8rem; color: #64748b; line-height: 1.5;">
                    * هذه الفاتورة صادرة إلكترونياً من متجر رونق اليمن.<br>
                    * ضمان الفحص والاستبدال يسري لمدة 14 يوماً من تاريخ الاستلام.<br>
                    * لخدمة العملاء: +967 777 123 456
                </div>
                <div style="text-align: left; min-width: 200px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.3rem;">
                        <span>المجموع الفرعي:</span>
                        <strong>${(order.subtotal || order.total || 0).toLocaleString()} ر.ي</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.3rem; color: #10b981;">
                        <span>الشحن والتوصيل:</span>
                        <strong>مجاني</strong>
                    </div>
                    ${order.discount ? `
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.3rem; color: #ec4899;">
                            <span>خصم الكوبون:</span>
                            <strong>- ${(order.discount).toLocaleString()} ر.ي</strong>
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 900; color: #6366f1; border-top: 1px solid #cbd5e1; padding-top: 0.5rem; margin-top: 0.5rem;">
                        <span>الإجمالي المطلوب:</span>
                        <span>${(order.total || order.subtotal || 0).toLocaleString()} ر.ي</span>
                    </div>
                </div>
            </div>

            <div class="no-print" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="btn-outline" onclick="closeInvoiceModal()">إغلاق</button>
                <button class="btn-primary" onclick="window.print()">
                    <i class="fa-solid fa-print"></i> طباعة الفاتورة الآن
                </button>
            </div>
        </div>
    `;

    overlay.classList.add('active');
}

function closeInvoiceModal() {
    const overlay = document.getElementById('invoiceModalOverlay');
    if (overlay) overlay.classList.remove('active');
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
                        <div class="search-item-name" style="font-weight: 700; font-size: 0.9rem;">${p.name}</div>
                        <div class="search-item-price" style="color: var(--brand-primary); font-weight: 800; font-size: 0.85rem;">${p.price.toLocaleString()} ر.ي</div>
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

    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });

    const trackingForm = document.getElementById('orderTrackingForm');
    if (trackingForm) trackingForm.addEventListener('submit', handleTrackOrderSubmit);

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
