/**
 * لوحة تحكم إدارة متجر رونق الفاخر - اليمن (Rawnaq Yemen Admin Dashboard Logic)
 * إدارة كاملة للمنتجات، المخططات البيانية، الطلبات، الكوبونات، تصدير CSV، والتواصل عبر واتساب
 */

const AUTH_CONFIG = {
    USER_KEY: 'rawnaq_admin_username',
    PASS_KEY: 'rawnaq_admin_password',
    SESSION_KEY: 'rawnaq_admin_authenticated'
};

let currentEditingProductId = null;
let productToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    initAdminTheme();
    loadDashboardStats();
    renderAnalyticsCharts();
    renderAdminProducts();
    renderAdminOrders();
    renderAdminCoupons();
    initAdminEventListeners();
    updateAdminNameDisplay();
    loadStoreSettingsForm();
});

// ==========================================
// إعدادات المتجر وأرقام التواصل (Store & WhatsApp Settings)
// ==========================================
function loadStoreSettingsForm() {
    const settings = getStoreSettings();
    const waInput = document.getElementById('settingWhatsappNumber');
    const supportPhoneInput = document.getElementById('settingSupportPhone');
    const unsNameInput = document.getElementById('settingUnsBeneficiaryName');
    const unsPhoneInput = document.getElementById('settingUnsPhone');
    const unsAccountInput = document.getElementById('settingUnsAccount');
    const thresholdInput = document.getElementById('settingFreeShippingThreshold');

    if (waInput) waInput.value = settings.whatsappNumber || '967777123456';
    if (supportPhoneInput) supportPhoneInput.value = settings.supportPhone || '+967 777 123 456';
    if (unsNameInput) unsNameInput.value = settings.unsBeneficiaryName || 'متجر رونق اليمن المعتمد';
    if (unsPhoneInput) unsPhoneInput.value = settings.unsPhone || '777123456';
    if (unsAccountInput) unsAccountInput.value = settings.unsAccount || '55443322';
    if (thresholdInput) thresholdInput.value = settings.freeShippingThreshold || 100000;
}

function handleSaveStoreSettings(e) {
    e.preventDefault();

    const waNumber = document.getElementById('settingWhatsappNumber').value.trim().replace(/[\s+-]/g, '');
    const supportPhone = document.getElementById('settingSupportPhone').value.trim();
    const unsBeneficiaryName = document.getElementById('settingUnsBeneficiaryName').value.trim();
    const unsPhone = document.getElementById('settingUnsPhone').value.trim();
    const unsAccount = document.getElementById('settingUnsAccount').value.trim();
    const freeShippingThreshold = Number(document.getElementById('settingFreeShippingThreshold').value) || 100000;

    const newSettings = {
        whatsappNumber: waNumber,
        supportPhone: supportPhone || '+967 777 123 456',
        landlinePhone: '+967 1 445566',
        unsBeneficiaryName: unsBeneficiaryName || 'متجر رونق اليمن المعتمد',
        unsPhone: unsPhone || '777123456',
        unsAccount: unsAccount || '55443322',
        freeShippingThreshold: freeShippingThreshold
    };

    saveStoreSettings(newSettings);
    showAdminToast(`تم تحديث رقم الواتساب (${waNumber}) وبيانات التواصل بنجاح!`, 'success');
}

// ==========================================
// التحقق من الجلسة والأمان (Auth & Security)
// ==========================================
function checkAdminAuth() {
    const isAuth = sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY) === 'true' || 
                   localStorage.getItem(AUTH_CONFIG.SESSION_KEY) === 'true';
    if (!isAuth) {
        window.location.href = 'login.html';
    }
}

function handleAdminLogout() {
    if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة التحكم؟')) {
        sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        showAdminToast('تم تسجيل الخروج بنجاح! جاري تحويلك...', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 600);
    }
}

function updateAdminNameDisplay() {
    const username = localStorage.getItem(AUTH_CONFIG.USER_KEY) || 'admin';
    const topbarName = document.getElementById('topbarAdminName');
    const inputUsername = document.getElementById('currentAdminUsername');
    if (topbarName) topbarName.innerText = `المدير (${username})`;
    if (inputUsername) inputUsername.value = username;
}

function handleChangeCredentials(e) {
    e.preventDefault();

    const currentUsername = localStorage.getItem(AUTH_CONFIG.USER_KEY) || 'admin';
    const currentPassword = localStorage.getItem(AUTH_CONFIG.PASS_KEY) || 'admin123';

    const enteredUsername = document.getElementById('currentAdminUsername').value.trim();
    const enteredCurrentPass = document.getElementById('currentAdminPassword').value;
    const newPass = document.getElementById('newAdminPassword').value;
    const confirmNewPass = document.getElementById('confirmNewAdminPassword').value;

    if (enteredCurrentPass !== currentPassword) {
        showAdminToast('كلمة المرور الحالية غير صحيحة!', 'error');
        return;
    }

    if (newPass !== confirmNewPass) {
        showAdminToast('كلمة المرور الجديدة غير متطابقة مع التأكيد!', 'error');
        return;
    }

    if (newPass.length < 4) {
        showAdminToast('يجب أن تتكون كلمة المرور من 4 خانات على الأقل', 'error');
        return;
    }

    localStorage.setItem(AUTH_CONFIG.USER_KEY, enteredUsername);
    localStorage.setItem(AUTH_CONFIG.PASS_KEY, newPass);

    updateAdminNameDisplay();
    document.getElementById('currentAdminPassword').value = '';
    document.getElementById('newAdminPassword').value = '';
    document.getElementById('confirmNewAdminPassword').value = '';

    showAdminToast('تم تحديث بيانات الدخول بنجاح! يمكنك استخدامها الآن', 'success');
}

// ==========================================
// إدارة المظهر (Theme)
// ==========================================
function initAdminTheme() {
    const savedTheme = localStorage.getItem('rawnaq_yemen_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleAdminTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('rawnaq_yemen_theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('adminThemeBtn');
    if (btn) {
        btn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }
}

// ==========================================
// التبديل بين التبويبات (Tabs Switching)
// ==========================================
function switchTab(tabId, clickedElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    if (clickedElement) {
        clickedElement.classList.add('active');
    }

    const titleEl = document.getElementById('adminPageTitle');
    const descEl = document.getElementById('adminPageDesc');
    
    if (tabId === 'tab-products') {
        if (titleEl) titleEl.innerText = 'إدارة منتجات رونق والمخزون';
        if (descEl) descEl.innerText = 'إضافة، تعديل الأسعار (ر.ي) والمواصفات، وحذف المنتجات';
        renderAdminProducts();
    } else if (tabId === 'tab-orders') {
        if (titleEl) titleEl.innerText = 'إدارة طلبات المحافظات اليمنية';
        if (descEl) descEl.innerText = 'متابعة طلبات صنعاء، عدن، حضرموت وتحديث حالات التوصيل';
        renderAdminOrders();
    } else if (tabId === 'tab-coupons') {
        if (titleEl) titleEl.innerText = 'إدارة الكوبونات والخصومات';
        if (descEl) descEl.innerText = 'إنشاء وإدارة رموز العروض الترويجية لمتجر رونق اليمن';
        renderAdminCoupons();
    } else if (tabId === 'tab-settings') {
        if (titleEl) titleEl.innerText = 'إعدادات المتجر والتواصل والأمان';
        if (descEl) descEl.innerText = 'تحديث رقم الواتساب لطلبات العملاء وبيانات الدخول';
        updateAdminNameDisplay();
        loadStoreSettingsForm();
    } else {
        if (titleEl) titleEl.innerText = 'لوحة تحكم رونق اليمن';
        if (descEl) descEl.innerText = 'نظرة عامة على أداء المتجر والمؤشرات بالريال اليمني';
        loadDashboardStats();
        renderAnalyticsCharts();
    }
}

// ==========================================
// حساب وتحديث الإحصائيات (Dashboard Stats)
// ==========================================
function loadDashboardStats() {
    const products = getStoreProducts();
    const orders = getStoreOrders();

    const prodCountEl = document.getElementById('statTotalProducts');
    if (prodCountEl) prodCountEl.innerText = products.length;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const revEl = document.getElementById('statTotalRevenue');
    if (revEl) revEl.innerText = `${totalRevenue.toLocaleString()} ر.ي`;

    const ordersCountEl = document.getElementById('statTotalOrders');
    if (ordersCountEl) ordersCountEl.innerText = orders.length;

    const lowStockCount = products.filter(p => !p.inStock || (p.stockCount && p.stockCount < 10)).length;
    const lowStockEl = document.getElementById('statLowStock');
    if (lowStockEl) lowStockEl.innerText = lowStockCount;

    const ordersBadge = document.getElementById('sidebarOrdersBadge');
    if (ordersBadge) ordersBadge.innerText = orders.length;
}

// ==========================================
// المخططات البيانية التفاعلية (Analytics Charts)
// ==========================================
function renderAnalyticsCharts() {
    const orders = getStoreOrders();
    
    // 1. توزيع الطلبات حسب المحافظات
    const cityCounts = {};
    orders.forEach(o => {
        const city = o.customerCity || 'أخرى';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const cityListContainer = document.getElementById('analyticsCityList');
    if (cityListContainer) {
        const totalOrders = orders.length || 1;
        const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);

        if (sortedCities.length === 0) {
            cityListContainer.innerHTML = '<p style="color: var(--text-muted);">لا توجد بيانات كافية لعرض التوزيع.</p>';
        } else {
            cityListContainer.innerHTML = sortedCities.map(([city, count]) => {
                const percent = Math.round((count / totalOrders) * 100);
                return `
                    <div class="city-progress-item">
                        <div class="city-progress-header">
                            <span>${city}</span>
                            <span><strong>${count}</strong> طلبات (${percent}%)</span>
                        </div>
                        <div class="city-progress-track">
                            <div class="city-progress-fill" style="width: ${percent}%;"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // 2. مخطط المبيعات الأسبوعي
    const barsContainer = document.getElementById('analyticsWeeklyBars');
    if (barsContainer) {
        const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
        const mockValues = [45, 70, 90, 60, 85, 100, 75]; // نسب تقديرية جذابة
        
        barsContainer.innerHTML = days.map((day, idx) => `
            <div class="chart-bar-item">
                <div class="chart-bar-fill" style="height: ${mockValues[idx]}%;" title="${day}: مبيعات نشطة"></div>
                <span class="chart-bar-label">${day}</span>
            </div>
        `).join('');
    }
}

// ==========================================
// تصدير البيانات إلى Excel / CSV (CSV Export)
// ==========================================
function exportOrdersCSV() {
    const orders = getStoreOrders();
    if (orders.length === 0) {
        showAdminToast('لا توجد طلبات لتصديرها', 'error');
        return;
    }

    let csv = '\uFEFFرقم الطلب,اسم العميل,رقم الهاتف,المحافظة,العنوان,طريقة الدفع,رقم السند,عدد المنتجات,الإجمالي (ر.ي),الحالة,التاريخ\n';
    orders.forEach(o => {
        const row = [
            `"${o.id}"`,
            `"${o.customerName}"`,
            `"${o.customerPhone}"`,
            `"${o.customerCity}"`,
            `"${o.customerAddress || ''}"`,
            `"${o.paymentMethod}"`,
            `"${o.voucherNumber || ''}"`,
            o.items ? o.items.length : 1,
            o.total || o.subtotal || 0,
            `"${getStatusText(o.status)}"`,
            `"${o.date || ''}"`
        ];
        csv += row.join(',') + '\n';
    });

    downloadCSVFile(csv, 'rawnaq_yemen_orders.csv');
    showAdminToast('تم تصدير ملف طلبات متجر رونق بنجاح!', 'success');
}

function exportProductsCSV() {
    const products = getStoreProducts();
    if (products.length === 0) {
        showAdminToast('لا توجد منتجات لتصديرها', 'error');
        return;
    }

    let csv = '\uFEFFالمعرف,اسم المنتج,القسم,السعر الحالي (ر.ي),السعر الأصلي,الخصم %,المخزون,حالة التوفر,التقييم\n';
    products.forEach(p => {
        const row = [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${getCategoryLabel(p.category)}"`,
            p.price,
            p.originalPrice || '',
            p.discount || 0,
            p.stockCount || 0,
            p.inStock ? 'متوفر' : 'نفد',
            p.rating || 5
        ];
        csv += row.join(',') + '\n';
    });

    downloadCSVFile(csv, 'rawnaq_yemen_products.csv');
    showAdminToast('تم تصدير ملف منتجات متجر رونق بنجاح!', 'success');
}

function downloadCSVFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// مراسلة العميل عبر واتساب (WhatsApp Direct Chat)
// ==========================================
function contactCustomerWhatsApp(phone, orderId, customerName) {
    let cleanPhone = phone.replace(/[\s+-]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '967' + cleanPhone.substring(1);
    if (!cleanPhone.startsWith('967') && cleanPhone.length === 9) cleanPhone = '967' + cleanPhone;

    const message = `مرحباً ${customerName} 💎%0Aمعك إدارة *متجر رونق اليمن*. بخصوص طلبك رقم *${orderId}*، نود تأكيد موعد الشحن والتسليم لك. هل العنوان والوقت مناسبان لك؟`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(waUrl, '_blank');
}

// ==========================================
// عرض وإدارة المنتجات (Products Table)
// ==========================================
function renderAdminProducts() {
    const tableBody = document.getElementById('adminProductsTableBody');
    if (!tableBody) return;

    const products = getStoreProducts();
    const searchVal = (document.getElementById('productSearchInput')?.value || '').toLowerCase();
    const categoryVal = document.getElementById('productCategoryFilter')?.value || 'all';

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchVal) || (p.description || '').toLowerCase().includes(searchVal);
        const matchCategory = categoryVal === 'all' || p.category === categoryVal;
        return matchSearch && matchCategory;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    <i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    لا توجد منتجات مطابقة لخيارات البحث في متجر رونق اليمن
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(p => {
        return `
            <tr>
                <td><strong>#${p.id}</strong></td>
                <td>
                    <div class="product-cell">
                        <img src="${p.image}" alt="${p.name}" class="product-thumb" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'">
                        <div class="product-cell-info">
                            <h4 title="${p.name}">${p.name}</h4>
                            <span>${p.badge ? `<span class="status-pill pending" style="padding: 0.1rem 0.4rem; font-size: 0.7rem;">${p.badge}</span>` : ''}</span>
                        </div>
                    </div>
                </td>
                <td>${getCategoryLabel(p.category)}</td>
                <td>
                    <strong style="color: var(--brand-primary);">${p.price.toLocaleString()} ر.ي</strong>
                    ${p.originalPrice ? `<div style="font-size: 0.75rem; text-decoration: line-through; color: var(--text-muted);">${p.originalPrice.toLocaleString()} ر.ي</div>` : ''}
                </td>
                <td>
                    <span class="status-pill ${p.inStock ? 'instock' : 'outofstock'}">
                        <i class="fa-solid ${p.inStock ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                        ${p.inStock ? `متوفر (${p.stockCount || 10})` : 'نفد من المخزون'}
                    </span>
                </td>
                <td>
                    <div class="stars" style="font-size: 0.8rem; color: #f59e0b;">
                        <i class="fa-solid fa-star"></i> ${p.rating || 5} (${p.reviewsCount || 0})
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="tbl-btn" onclick="openEditProductModal(${p.id})" title="تعديل السعر والمواصفات">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="tbl-btn delete" onclick="confirmDeleteProduct(${p.id})" title="حذف المنتج">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getCategoryLabel(catId) {
    const cats = {
        'electronics': 'إلكترونيات وذكاء اصطناعي',
        'perfumes': 'عطور وبخور فاخر',
        'watches': 'ساعات ومجوهرات',
        'fashion': 'أزياء واكسسوارات',
        'home': 'ديكور ومنزل'
    };
    return cats[catId] || catId;
}

// ==========================================
// نافذة إضافة وتعديل المنتج (Add/Edit Modal)
// ==========================================
function openAddProductModal() {
    currentEditingProductId = null;
    document.getElementById('productModalTitle').innerText = 'إضافة منتج جديد لمتجر رونق اليمن';
    document.getElementById('productForm').reset();
    
    document.getElementById('prodInStock').checked = true;
    document.getElementById('prodStockCount').value = 20;
    document.getElementById('prodRating').value = 5.0;
    document.getElementById('prodReviewsCount').value = 15;
    document.getElementById('prodImagePreview').src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
    document.getElementById('prodImageUrl').value = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

    document.getElementById('productModalOverlay').classList.add('active');
}

function openEditProductModal(productId) {
    const products = getStoreProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentEditingProductId = productId;
    document.getElementById('productModalTitle').innerText = `تعديل منتج #${product.id} - متجر رونق اليمن`;

    document.getElementById('prodName').value = product.name || '';
    document.getElementById('prodCategory').value = product.category || 'electronics';
    document.getElementById('prodPrice').value = product.price || '';
    document.getElementById('prodOriginalPrice').value = product.originalPrice || '';
    document.getElementById('prodDiscount').value = product.discount || '';
    document.getElementById('prodBadge').value = product.badge || '';
    document.getElementById('prodBadgeType').value = product.badgeType || 'hot';
    document.getElementById('prodStockCount').value = product.stockCount || 10;
    document.getElementById('prodInStock').checked = product.inStock !== false;
    document.getElementById('prodRating').value = product.rating || 5.0;
    document.getElementById('prodReviewsCount').value = product.reviewsCount || 10;
    document.getElementById('prodImageUrl').value = product.image || '';
    document.getElementById('prodImagePreview').src = product.image || '';
    document.getElementById('prodDescription').value = product.description || '';
    document.getElementById('prodFeatures').value = (product.features || []).join('\n');
    document.getElementById('prodColors').value = (product.colors || []).join(', ');
    document.getElementById('prodColorNames').value = (product.colorNames || []).join(', ');

    document.getElementById('productModalOverlay').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModalOverlay').classList.remove('active');
}

function handleProductFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value;
    const price = Number(document.getElementById('prodPrice').value);
    const originalPrice = document.getElementById('prodOriginalPrice').value ? Number(document.getElementById('prodOriginalPrice').value) : null;
    const discount = document.getElementById('prodDiscount').value ? Number(document.getElementById('prodDiscount').value) : 0;
    const badge = document.getElementById('prodBadge').value.trim();
    const badgeType = document.getElementById('prodBadgeType').value;
    const stockCount = Number(document.getElementById('prodStockCount').value);
    const inStock = document.getElementById('prodInStock').checked;
    const rating = Number(document.getElementById('prodRating').value) || 5.0;
    const reviewsCount = Number(document.getElementById('prodReviewsCount').value) || 10;
    const image = document.getElementById('prodImageUrl').value.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
    const description = document.getElementById('prodDescription').value.trim();
    
    const features = document.getElementById('prodFeatures').value
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

    const colors = document.getElementById('prodColors').value
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

    const colorNames = document.getElementById('prodColorNames').value
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

    const products = getStoreProducts();

    if (currentEditingProductId !== null) {
        const index = products.findIndex(p => p.id === currentEditingProductId);
        if (index > -1) {
            products[index] = {
                ...products[index],
                name,
                category,
                price,
                originalPrice,
                discount,
                badge,
                badgeType,
                stockCount,
                inStock,
                rating,
                reviewsCount,
                image,
                gallery: [image],
                description,
                features,
                colors: colors.length > 0 ? colors : ['#0f172a'],
                colorNames: colorNames.length > 0 ? colorNames : ['اللون الافتراضي']
            };
            saveStoreProducts(products);
            showAdminToast(`تم تحديث بيانات المنتج "${name.substring(0, 20)}..." بنجاح`, 'success');
        }
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            name,
            category,
            price,
            originalPrice,
            discount,
            badge: badge || 'جديد',
            badgeType: badgeType || 'new',
            stockCount,
            inStock,
            rating,
            reviewsCount,
            image,
            gallery: [image],
            description,
            features,
            colors: colors.length > 0 ? colors : ['#0f172a'],
            colorNames: colorNames.length > 0 ? colorNames : ['اللون الافتراضي'],
            isFeatured: true,
            isFlashDeal: false
        };
        products.unshift(newProduct);
        saveStoreProducts(products);
        showAdminToast(`تمت إضافة المنتج الجديد "${name.substring(0, 20)}..." إلى متجر رونق بنجاح!`, 'success');
    }

    closeProductModal();
    renderAdminProducts();
    loadDashboardStats();
}

// ==========================================
// حذف المنتجات (Delete Product Flow)
// ==========================================
function confirmDeleteProduct(productId) {
    productToDeleteId = productId;
    const products = getStoreProducts();
    const prod = products.find(p => p.id === productId);

    const nameEl = document.getElementById('deleteProductName');
    if (nameEl && prod) {
        nameEl.innerText = prod.name;
    }

    document.getElementById('deleteConfirmModalOverlay').classList.add('active');
}

function closeDeleteModal() {
    productToDeleteId = null;
    document.getElementById('deleteConfirmModalOverlay').classList.remove('active');
}

function executeDeleteProduct() {
    if (!productToDeleteId) return;

    let products = getStoreProducts();
    products = products.filter(p => p.id !== productToDeleteId);
    saveStoreProducts(products);

    closeDeleteModal();
    renderAdminProducts();
    loadDashboardStats();
    showAdminToast('تم حذف المنتج بنجاح من متجر رونق اليمن', 'info');
}

// ==========================================
// إدارة الطلبات (Orders Manager)
// ==========================================
function renderAdminOrders() {
    const tableBody = document.getElementById('adminOrdersTableBody');
    if (!tableBody) return;

    const orders = getStoreOrders();

    if (orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    <i class="fa-solid fa-receipt" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    لا توجد طلبات مسجلة حتى الآن في متجر رونق اليمن
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = orders.map(order => {
        return `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>
                    <strong>${order.customerName}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted); direction: ltr; text-align: right;">${order.customerPhone}</div>
                </td>
                <td><span class="status-pill pending" style="background: rgba(99, 102, 241, 0.1); color: var(--brand-primary);">${order.customerCity}</span></td>
                <td>${order.items ? order.items.length : 1} منتجات</td>
                <td><strong style="color: var(--brand-primary);">${(order.total || order.subtotal || 0).toLocaleString()} ر.ي</strong></td>
                <td>
                    <select class="sort-select" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>جاري التجهيز</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن مع المندوب</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>مكتمل / تم التسليم</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                    </select>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="tbl-btn whatsapp" onclick="contactCustomerWhatsApp('${order.customerPhone}', '${order.id}', '${order.customerName}')" title="مراسلة العميل بالواتساب">
                            <i class="fa-brands fa-whatsapp"></i>
                        </button>
                        <button class="tbl-btn" onclick="openOrderDetailsModal('${order.id}')" title="عرض تفاصيل الطلب">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const orders = getStoreOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveStoreOrders(orders);
        showAdminToast(`تم تحديث حالة الطلب ${orderId} إلى "${getStatusText(newStatus)}"`, 'success');
        loadDashboardStats();
        renderAnalyticsCharts();
    }
}

function getStatusText(status) {
    const map = {
        'pending': 'قيد الانتظار',
        'processing': 'جاري التجهيز',
        'shipped': 'تم الشحن مع المندوب',
        'completed': 'مكتمل / تم التسليم',
        'cancelled': 'ملغي'
    };
    return map[status] || status;
}

function openOrderDetailsModal(orderId) {
    const orders = getStoreOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const content = document.getElementById('orderDetailsContent');
    if (!content) return;

    content.innerHTML = `
        <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>تفاصيل الطلب: ${order.id}</h3>
                <span class="status-pill ${order.status}">${getStatusText(order.status)}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">تاريخ الطلب: ${order.date || 'اليوم'}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md);">
            <div>
                <strong>بيانات العميل:</strong>
                <p style="font-size: 0.9rem; margin-top: 0.3rem;">الاسم: <strong>${order.customerName}</strong></p>
                <p style="font-size: 0.9rem; direction: ltr; text-align: right;">الجوال: ${order.customerPhone}</p>
                <button class="btn-whatsapp-direct" style="margin-top: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="contactCustomerWhatsApp('${order.customerPhone}', '${order.id}', '${order.customerName}')">
                    <i class="fa-brands fa-whatsapp"></i> محادثة واتساب
                </button>
            </div>
            <div>
                <strong>عنوان التوصيل (اليمن):</strong>
                <p style="font-size: 0.9rem; margin-top: 0.3rem;">المحافظة: <strong>${order.customerCity}</strong></p>
                <p style="font-size: 0.9rem;">العنوان: ${order.customerAddress || 'الشارع العام'}</p>
                <p style="font-size: 0.9rem; color: var(--brand-primary); font-weight: 700;">طريقة الدفع: ${order.paymentMethod || 'كاش عند الاستلام'}</p>
                ${order.voucherNumber ? `<p style="font-size: 0.85rem; color: var(--brand-accent); font-weight: 800;">رقم سند الحوالة (UNS): ${order.voucherNumber}</p>` : ''}
            </div>
        </div>

        <h4 style="margin-bottom: 0.75rem;">المنتجات المطلوبة:</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
            ${(order.items || []).map(item => `
                <div style="display: flex; justify-content: space-between; padding: 0.6rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.9rem;">
                    <span>${item.name} × <strong>${item.quantity}</strong></span>
                    <strong style="color: var(--brand-primary);">${(item.price * item.quantity).toLocaleString()} ر.ي</strong>
                </div>
            `).join('')}
        </div>

        <div style="border-top: 1px dashed var(--border-color); padding-top: 0.75rem; display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; margin-bottom: 1.5rem;">
            <span>الإجمالي:</span>
            <span style="color: var(--brand-primary);">${(order.total || order.subtotal || 0).toLocaleString()} ر.ي</span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button class="btn-outline" onclick="closeOrderDetailsModal()">إغلاق</button>
            <button class="btn-primary" onclick="printOrderInvoice('${order.id}')">
                <i class="fa-solid fa-print"></i> طباعة الفاتورة وبوليصة الشحن
            </button>
        </div>
    `;

    document.getElementById('orderDetailsModalOverlay').classList.add('active');
}

function printOrderInvoice(orderId) {
    closeOrderDetailsModal();
    window.print();
}

function closeOrderDetailsModal() {
    document.getElementById('orderDetailsModalOverlay').classList.remove('active');
}

// ==========================================
// إدارة الكوبونات (Coupons Manager)
// ==========================================
function renderAdminCoupons() {
    const listContainer = document.getElementById('adminCouponsList');
    if (!listContainer) return;

    const coupons = getStoreCoupons();
    const entries = Object.entries(coupons);

    if (entries.length === 0) {
        listContainer.innerHTML = '<p style="color: var(--text-muted);">لا توجد كوبونات مضافة حالياً في رونق.</p>';
        return;
    }

    listContainer.innerHTML = entries.map(([code, data]) => {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 0.75rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <strong style="font-size: 1.1rem; color: var(--brand-primary); font-family: var(--font-heading);">${code}</strong>
                        <span class="status-pill instock">${(data.discount * 100)}% خصم</span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">${data.desc}</div>
                </div>
                <button class="tbl-btn delete" onclick="deleteCoupon('${code}')" title="حذف الكوبون">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    }).join('');
}

function handleAddCouponSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('newCouponCode').value.trim().toUpperCase();
    const discount = Number(document.getElementById('newCouponDiscount').value) / 100;
    const desc = document.getElementById('newCouponDesc').value.trim();

    if (!code || !discount) return;

    const coupons = getStoreCoupons();
    coupons[code] = {
        discount: discount,
        desc: desc || `خصم ${discount * 100}%`
    };

    saveStoreCoupons(coupons);
    renderAdminCoupons();
    document.getElementById('addCouponForm').reset();
    showAdminToast(`تم إنشاء كود الخصم ${code} بنجاح!`, 'success');
}

function deleteCoupon(code) {
    const coupons = getStoreCoupons();
    delete coupons[code];
    saveStoreCoupons(coupons);
    renderAdminCoupons();
    showAdminToast(`تم حذف الكوبون ${code}`, 'info');
}

// ==========================================
// إعادة ضبط البيانات الافتراضية (Reset DB)
// ==========================================
function handleResetDefaults() {
    if (confirm('هل أنت متأكد من رغبتك في استعادة جميع منتجات متجر رونق اليمن الافتراضية؟')) {
        resetStoreProducts();
        renderAdminProducts();
        loadDashboardStats();
        renderAnalyticsCharts();
        showAdminToast('تمت استعادة البيانات الافتراضية لمتجر رونق اليمن بنجاح', 'success');
    }
}

// ==========================================
// مستمعي الأحداث (Event Listeners)
// ==========================================
function initAdminEventListeners() {
    const themeBtn = document.getElementById('adminThemeBtn');
    if (themeBtn) themeBtn.addEventListener('click', toggleAdminTheme);

    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) searchInput.addEventListener('input', renderAdminProducts);

    const catFilter = document.getElementById('productCategoryFilter');
    if (catFilter) catFilter.addEventListener('change', renderAdminProducts);

    const imgUrlInput = document.getElementById('prodImageUrl');
    const imgPreview = document.getElementById('prodImagePreview');
    if (imgUrlInput && imgPreview) {
        imgUrlInput.addEventListener('input', (e) => {
            imgPreview.src = e.target.value || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
        });
    }

    const prodForm = document.getElementById('productForm');
    if (prodForm) prodForm.addEventListener('submit', handleProductFormSubmit);

    const couponForm = document.getElementById('addCouponForm');
    if (couponForm) couponForm.addEventListener('submit', handleAddCouponSubmit);
}

// ==========================================
// إشعارات لوحة الإدارة (Toast Notifications)
// ==========================================
function showAdminToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-info-circle'}"></i>
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
