/**
 * قاعدة بيانات متجر رونق الفاخر - الجمهورية اليمنية (Rawnaq Yemen Data & Storage)
 * تتضمن المنتجات، التصنيفات، الكوبونات، ونظام المزامنة مع العملة اليمنية (ر.ي)
 */

const DEFAULT_CATEGORIES = [
    { id: 'all', name: 'جميع المنتجات', icon: 'fa-cubes' },
    { id: 'electronics', name: 'إلكترونيات وذكاء اصطناعي', icon: 'fa-laptop' },
    { id: 'perfumes', name: 'عطور وبخور فاخر', icon: 'fa-spray-can-sparkles' },
    { id: 'watches', name: 'ساعات ومجوهرات', icon: 'fa-clock' },
    { id: 'fashion', name: 'أزياء واكسسوارات', icon: 'fa-vest-patches' },
    { id: 'home', name: 'ديكور ومقتنيات منزلية', icon: 'fa-couch' }
];

const DEFAULT_COUPONS = {
    'RAWNAQ10': { discount: 0.10, desc: 'خصم 10% بمناسبة إطلاق رونق اليمن' },
    'RAWNAQ20': { discount: 0.20, desc: 'خصم 20% للطلبات المميزة' },
    'VIPYEMEN': { discount: 0.15, desc: 'خصم 15% لنادي VIP اليمن' }
};

const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: 'سماعات الرأس اللاسلكية Rawnaq Pro Max',
        category: 'electronics',
        price: 85000,
        originalPrice: 110000,
        discount: 23,
        rating: 4.9,
        reviewsCount: 168,
        badge: 'الأكثر طلباً',
        badgeType: 'hot',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'سماعات رأس لاسلكية احترافية من رونق مع ميزة العزل النشط للضوضاء وتجربة صوت محيطي ثلاثي الأبعاد فائق النقاء، مع بطارية تدوم حتى 40 ساعة من التشغيل المتواصل.',
        features: [
            'عزل نشط للضوضاء (ANC) متطور من الجيل الأحدث',
            'بطارية تدوم حتى 40 ساعة تشغيل متواصل',
            'صوت محيطي Spatial Audio ثلاثي الأبعاد بدقة استوديو',
            'هيكل فخم من الألمنيوم المصقول والجلد الطبيعي',
            'ميكروفونات ذكية مدمجة للمكالمات فائقة النقاء'
        ],
        colors: ['#1e293b', '#e2e8f0', '#6366f1'],
        colorNames: ['أسود كربوني', 'فضي ناصع', 'نيلي رونق'],
        inStock: true,
        stockCount: 18,
        isFeatured: true,
        isFlashDeal: true
    },
    {
        id: 2,
        name: 'عطر رونق العود الملكي الخاص - 100 مل',
        category: 'perfumes',
        price: 62000,
        originalPrice: 80000,
        discount: 22,
        rating: 5.0,
        reviewsCount: 245,
        badge: 'حصري',
        badgeType: 'exclusive',
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'مزيج ساحر واستثنائي من دهن العود الكمبودي النقي ونفحات العنبر والمسك الأبيض مع لمسات من الهيل والزعفران الملكي، مصمم خصيصاً لعشاق التميز والأناقة.',
        features: [
            'ثبات فائق يدوم لأكثر من 48 ساعة متواصلة',
            'مستخلص من دهن العود الطبيعي النقي 100%',
            'زجاجة كريستالية فاخرة بلمسات ذهبية متألقة',
            'تغليف هدايا ملكي فاخر مجاني مع كل طلب'
        ],
        colors: ['#d97706'],
        colorNames: ['عسلي ذهبي'],
        inStock: true,
        stockCount: 12,
        isFeatured: true,
        isFlashDeal: true
    },
    {
        id: 3,
        name: 'ساعة يد كرونوغراف ميكانيكية أوتوماتيك Rawnaq Elite',
        category: 'watches',
        price: 135000,
        originalPrice: 175000,
        discount: 23,
        rating: 4.8,
        reviewsCount: 96,
        badge: 'خصم مميز',
        badgeType: 'sale',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'ساعة رجالية كلاسيكية بتصميم هندسي راقٍ، زجاج ياقوتي مقاوم للخدش، وحزام من الفولاذ المقاوم للصدأ مع حركة ميكانيكية سويسرية دقيقة.',
        features: [
            'حركة سويسرية أوتوماتيكية دقيقة',
            'مقاومة للماء حتى عمق 100 متر (10 ATM)',
            'زجاج ياقوتي Sapphire Crystal مقاوم للخدوش',
            'عرض التاريخ والتوقيت المزدوج'
        ],
        colors: ['#0f172a', '#b45309', '#64748b'],
        colorNames: ['أسود كربوني', 'ذهبي وردي', 'فضي كلاسيكي'],
        inStock: true,
        stockCount: 14,
        isFeatured: true,
        isFlashDeal: false
    },
    {
        id: 4,
        name: 'هاتف ذكي Rawnaq Vision Pro 5G Ultra',
        category: 'electronics',
        price: 320000,
        originalPrice: 360000,
        discount: 11,
        rating: 4.9,
        reviewsCount: 340,
        badge: 'إصدار 2026',
        badgeType: 'new',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'شاشة OLED بدقة 2K ومعدل تحديث 144Hz، معالج ثماني النواة من الجيل الأحدث، ونظام كاميرات سينمائي بدقة 200 ميجابكسل مع دعم الذكاء الاصطناعي.',
        features: [
            'كاميرا بدقة 200MP مع تقريب بصري 10x',
            'شاشة 6.8 بوصة OLED 144Hz فائقة السلاسة',
            'شحن سريع بقدرة 120 واط (100% في 18 دقيقة)',
            'سعة تخزين 512GB مع 16GB RAM'
        ],
        colors: ['#18181b', '#f8fafc', '#047857'],
        colorNames: ['أسود تيتانيوم', 'أبيض لؤلؤي', 'أخضر زمردي'],
        inStock: true,
        stockCount: 25,
        isFeatured: true,
        isFlashDeal: true
    },
    {
        id: 5,
        name: 'حقيبة يد جلد طبيعي إيطالي كلاسيك Rawnaq Collection',
        category: 'fashion',
        price: 48000,
        originalPrice: 65000,
        discount: 26,
        rating: 4.7,
        reviewsCount: 82,
        badge: 'خصم 26%',
        badgeType: 'sale',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'مصنوعة يدوياً من أفخر أنواع الجلود الإيطالية الطبيعية المتينة، بتصميم عصري وأنيق يتسع لجميع الاحتياجات اليومية مع مقصورات متعددة.',
        features: [
            'جلد بقري طبيعي 100% عالي المتانة',
            'سحابات مطلية بماء الذهب ومقاومة للصدأ',
            'حزام كتف قابل للتعديل والإزالة',
            'مساحة مخصصة للابتوب حتى 14 بوصة'
        ],
        colors: ['#78350f', '#0f172a', '#9a3412'],
        colorNames: ['بني كلاسيكي', 'أسود ملكي', 'هافان'],
        inStock: true,
        stockCount: 14,
        isFeatured: false,
        isFlashDeal: false
    },
    {
        id: 6,
        name: 'أباجورة طاولة مودرن ذكية بإضاءة محيطية RGB',
        category: 'home',
        price: 26000,
        originalPrice: 34000,
        discount: 23,
        rating: 4.9,
        reviewsCount: 120,
        badge: 'موصى به',
        badgeType: 'hot',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'إضاءة محيطية ذكية بـ 16 مليون لون مع إمكانية التحكم عبر تطبيق الهاتف أو الأوامر الصوتية، وقاعدة شحن لاسلكي مدمجة للهواتف والساعات.',
        features: [
            'تحكم ذكي عبر الواي فاي والبلوتوث',
            'قاعدة شحن لاسلكي سريع 15W',
            'تزامن الإضاءة مع الموسيقى والألعاب',
            'أوضاع متعددة للقراءة والاسترخاء والنوم'
        ],
        colors: ['#f8fafc', '#1e293b'],
        colorNames: ['أبيض رخامي', 'أسود غير لامع'],
        inStock: true,
        stockCount: 30,
        isFeatured: false,
        isFlashDeal: false
    },
    {
        id: 7,
        name: 'نظارة شمسية كلاسيكية مستقطبة UV400 Rawnaq Classic',
        category: 'fashion',
        price: 32000,
        originalPrice: 45000,
        discount: 28,
        rating: 4.6,
        reviewsCount: 71,
        badge: 'خصم',
        badgeType: 'sale',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'إطار خفيف الوزن من ألياف الكربون مع عدسات مستقطبة تحمي بنسبة 100% من الأشعة فوق البنفسجية وتوفر رؤية واضحة ومريحة للعينين.',
        features: [
            'حماية كاملة UV400 ضد الأشعة الضارة',
            'عدسات بولارايزد مضادة للانعكاسات',
            'إطار مرن وخفيف الوزن للغاية',
            'تشمل حافظة جلدية فاخرة وقطعة تنظيف ميكروفايبر'
        ],
        colors: ['#0f172a', '#78350f'],
        colorNames: ['أسود لامع', 'نقشة تايجر'],
        inStock: true,
        stockCount: 20,
        isFeatured: false,
        isFlashDeal: false
    },
    {
        id: 8,
        name: 'مبخرة كهربائية إلكترونية ذكية متنقلة Rawnaq Scent',
        category: 'perfumes',
        price: 19000,
        originalPrice: 26000,
        discount: 27,
        rating: 4.9,
        reviewsCount: 195,
        badge: 'الأكثر مبيعاً',
        badgeType: 'hot',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'مبخرة متنقلة تعمل ببطارية قابلة للشحن عبر منفذ Type-C، تسخن البخور فورياً دون الحاجة لفحم، مثالية للسيارة، المكتب، والمنزل.',
        features: [
            'تسخين سريع خلال ثوانٍ معدودة',
            'آمنة تماماً مع نظام إيقاف تلقائي',
            'بطارية تدوم لأكثر من 15 استخدام للشحنة',
            'تصميم أنيق وصغير الحجم سهل الحمل'
        ],
        colors: ['#1e1b4b', '#451a03'],
        colorNames: ['كحلي فاخر', 'عودي داكن'],
        inStock: true,
        stockCount: 45,
        isFeatured: true,
        isFlashDeal: true
    },
    {
        id: 9,
        name: 'ماكينة قهوة إسبريسو احترافية متعددة الوظائف Rawnaq Barista',
        category: 'home',
        price: 120000,
        originalPrice: 155000,
        discount: 22,
        rating: 4.8,
        reviewsCount: 104,
        badge: 'مميز',
        badgeType: 'hot',
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'ماكينة تحضير قهوة إسبريسو وكابتشينو بضغط 20 بار مع مطحنة حبوب مدمجة وعصا تبخير الحليب لصنع رغوة مخملية كالمقاهي العالمية.',
        features: [
            'مضخة إيطالية بقوة ضغط 20 بار',
            'مطحنة مخروطية متكاملة بـ 15 درجة طحن',
            'نظام تسخين سريع ThermoBlock خلال 30 ثانية',
            'خزان مياه كبير بسعة 2.5 لتر قابل للإزالة'
        ],
        colors: ['#475569', '#0f172a'],
        colorNames: ['فولاذ ستانلس ستيل', 'أسود مات'],
        inStock: true,
        stockCount: 8,
        isFeatured: false,
        isFlashDeal: false
    }
];

const DEFAULT_ORDERS = [
    {
        id: 'RNQ-781924',
        customerName: 'طارق الأهدل',
        customerPhone: '771234567',
        customerCity: 'صنعاء',
        customerAddress: 'شارع حدة، جوار بريد حدة',
        paymentMethod: 'حوالة عبر الشبكة الموحدة فقط (UNS)',
        items: [
            { id: 1, name: 'سماعات الرأس اللاسلكية Rawnaq Pro Max', quantity: 1, price: 85000 }
        ],
        subtotal: 85000,
        total: 85000,
        status: 'completed',
        date: '2026-09-02 08:30'
    },
    {
        id: 'RNQ-592183',
        customerName: 'أروى باوزير',
        customerPhone: '739876543',
        customerCity: 'المكلا - حضرموت',
        customerAddress: 'حي الديس، الشارع العام',
        paymentMethod: 'الكريمي / حاسب',
        items: [
            { id: 2, name: 'عطر رونق العود الملكي الخاص - 100 مل', quantity: 2, price: 62000 },
            { id: 8, name: 'مبخرة كهربائية إلكترونية ذكية متنقلة Rawnaq Scent', quantity: 1, price: 19000 }
        ],
        subtotal: 143000,
        total: 143000,
        status: 'processing',
        date: '2026-09-02 09:15'
    }
];

// ==========================================
// دوال إدارة ومزامنة التخزين المحلي (Storage Handlers)
// ==========================================

const STORAGE_KEYS = {
    PRODUCTS: 'rawnaq_yemen_products',
    CATEGORIES: 'rawnaq_yemen_categories',
    COUPONS: 'rawnaq_yemen_coupons',
    ORDERS: 'rawnaq_yemen_orders'
};

// المنتجات
function getStoreProducts() {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
        saveStoreProducts(DEFAULT_PRODUCTS);
        return DEFAULT_PRODUCTS;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return DEFAULT_PRODUCTS;
    }
}

function saveStoreProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function resetStoreProducts() {
    saveStoreProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
}

// التصنيفات
function getStoreCategories() {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) {
        saveStoreCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return DEFAULT_CATEGORIES;
    }
}

function saveStoreCategories(categories) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

// الكوبونات
function getStoreCoupons() {
    const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!data) {
        saveStoreCoupons(DEFAULT_COUPONS);
        return DEFAULT_COUPONS;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return DEFAULT_COUPONS;
    }
}

function saveStoreCoupons(coupons) {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
}

// الطلبات
function getStoreOrders() {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
        saveStoreOrders(DEFAULT_ORDERS);
        return DEFAULT_ORDERS;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return DEFAULT_ORDERS;
    }
}

function saveStoreOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function addStoreOrder(order) {
    const orders = getStoreOrders();
    orders.unshift(order);
    saveStoreOrders(orders);
}

const STORE_CATEGORIES = getStoreCategories();
const STORE_COUPONS = getStoreCoupons();
const STORE_PRODUCTS = getStoreProducts();
