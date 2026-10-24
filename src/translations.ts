import { Language } from './types';

export interface Translations {
  dir: 'rtl' | 'ltr';
  title: string;
  announcements: string[];
  nav: {
    new: string;
    collections: string;
    story: string;
    reviews: string;
  };
  menuHead: string;
  menuLinks: string[];
  menuNote: string;
  heroEyebrow: string;
  heroHeading: string;
  heroText: string;
  discover: string;
  weekEdit: string;
  closetHeading: string;
  viewAll: string;
  categories: {
    abayas: string;
    everyday: string;
    details: string;
  };
  categoryPieces: string[];
  freshEyebrow: string;
  productsHeading: string;
  filters: {
    all: string;
    abayas: string;
    sets: string;
    dresses: string;
  };
  productNames: Record<string, string>;
  productShades: Record<string, string>;
  addToBag: string;
  tags: {
    new: string;
    bestseller: string;
  };
  manifestoEyebrow: string;
  manifestoHeading: string;
  manifestoText: string;
  manifestoMore: string;
  values: string[];
  reviewsEyebrow: string;
  reviewsHeading: string;
  reviews: string[];
  verified: string;
  guarantee: {
    badgeDays: string;
    badgeUnit: string;
    title: string;
    desc: string;
  };
  newsletterEyebrow: string;
  newsletterHeading: string;
  emailPlaceholder: string;
  emailLabel: string;
  subscribe: string;
  privacy: string;
  footerRights: string;
  searchComingSoon: string;
  bagEmpty: string;
  addedToast: string;
  filterShowing: string;
  newsletterThanks: string;
  search: {
    title: string;
    placeholder: string;
    quickSuggestions: string;
    suggestions: string[];
    resultsCount: string;
    noResults: string;
    noResultsHint: string;
    viewAllProducts: string;
    escHint: string;
    inStock: string;
    outOfStock: string;
    addToBag: string;
  };
  productModal: {
    selectSize: string;
    selectColor: string;
    quantity: string;
    addToBag: string;
    orderNow: string;
    inStock: string;
    outOfStock: string;
    outOfStockNotice: string;
    features: string[];
    galleryHint: string;
    detailsTitle: string;
    close: string;
  };
  cart: {
    title: string;
    itemCount: string;
    emptyTitle: string;
    emptyDesc: string;
    emptyAction: string;
    checkoutEyebrow: string;
    checkoutHeading: string;
    deliveryMethod: string;
    office: string;
    officeDesc: string;
    home: string;
    homeDesc: string;
    wilaya: string;
    wilayaPrompt: string;
    address: string;
    addressPlaceholder: string;
    name: string;
    namePlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    subtotal: string;
    shipping: string;
    shippingSelectWilaya: string;
    total: string;
    placeOrder: string;
    orderHint: string;
    backToShop: string;
    secureDelivery: string;
    assurances: string[];
    successEyebrow: string;
    successHeading: string;
    successDesc: string;
    successAction: string;
    remove: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ar: {
    dir: 'rtl',
    title: 'Miee — أناقةٌ تشبهك',
    announcements: [
      'توصيل سريع إلى 58 ولاية',
      'الدفع عند الاستلام',
      'استبدال سهل خلال 15 يوماً'
    ],
    nav: {
      new: 'الجديد',
      collections: 'المجموعات',
      story: 'قصتنا',
      reviews: 'آراء عميلاتنا'
    },
    menuHead: 'القائمة',
    menuLinks: ['آخر الإصدارات', 'المجموعات', 'عن Miee', 'تجارب العميلات'],
    menuNote: 'بساطة مدروسة،<br>أناقة لا تمرّ مروراً عابراً.',
    heroEyebrow: "ATELIER D'ÉLÉGANCE",
    heroHeading: 'Miee Closet',
    heroText: 'مساحة للأناقة اليومية والتصاميم الراقية المختارة بعناية لترافقك في كل إطلالة.',
    discover: 'اكتشفي المجموعة',
    weekEdit: 'اختيارات هذا الأسبوع',
    closetHeading: 'خزانةٌ صغيرة.<br>احتمالات <span>كبيرة.</span>',
    viewAll: 'شاهدي الكل',
    categories: {
      abayas: 'عبايات',
      everyday: 'إطلالات يومية',
      details: 'التفاصيل'
    },
    categoryPieces: ['03 قطعة', '12 قطعة', '08 قطع'],
    freshEyebrow: 'وصل حديثاً',
    productsHeading: 'القطع التي <span>تحتاجينها</span>',
    filters: {
      all: 'الكل',
      abayas: 'عبايات',
      sets: 'أطقم',
      dresses: 'فساتين'
    },
    productNames: {
      noor: 'عباية نُور',
      sama: 'طقم سَما',
      lina: 'فستان لِين',
      mada: 'جاكيت مَدى'
    },
    productShades: {
      noor: 'أسود ليلي',
      sama: 'بيج رملي',
      lina: 'بني موكا',
      mada: 'رمادي دخاني'
    },
    addToBag: 'أضيفي إلى الحقيبة',
    tags: {
      new: 'جديد',
      bestseller: 'الأكثر طلباً'
    },
    manifestoEyebrow: 'فلسفتنا',
    manifestoHeading: 'نصمّم للمرأة التي تعرف أن حضورها لا يحتاج إلى ضجيج.',
    manifestoText: 'في Miee، نؤمن أن القطعة الجيدة هي التي تشعرك بأنها لكِ منذ المرة الأولى. لذلك نختار الأقمشة والقصات والتفاصيل بعين تهتم بالراحة بقدر اهتمامها بالجمال.',
    manifestoMore: 'تعرفي علينا أكثر',
    values: ['تفاصيل مدروسة', 'خامات ناعمة', 'أناقة تدوم'],
    reviewsEyebrow: 'من رسائلكنّ',
    reviewsHeading: 'كلماتكنّ هي <span>قصتنا</span>',
    reviews: [
      '“كنت خايفة من القياسات لكن جات مضبوطة تماماً. التوصيل كان سريع جداً حتى لباب الدار، وتجربة الشراء مريحة لأقصى درجة.”',
      '“خدمة الزبائن قمة في الاحترافية، ساعدوني في اختيار المقاس المناسب ووصلتني الطلبية في يومين فقط.”',
      '“هايل مشاء الله”'
    ],
    verified: 'عميلة موثّقة',
    guarantee: {
      badgeDays: '58',
      badgeUnit: 'ولاية',
      title: 'ضمان الجودة والمقاس المثالي توصيل لكافة الـ 58 ولاية',
      desc: 'ثقتكِ هي أولويتنا القصوى. نضمن لكِ استبدالاً فورياً وسريعاً عند الاستلام في حال وجود أي مشكلة في المقاس أو القماش، مع توصيل موثوق ومباشر حتى باب منزلكِ في جميع الـ 58 ولاية. تسوّقي براحة بال تامة واطمئنان. ✨'
    },
    newsletterEyebrow: 'رسالة صغيرة منكِ وإليكِ',
    newsletterHeading: 'كوني الأقرب<br>لكل <span>جديد.</span>',
    emailLabel: 'بريدك الإلكتروني',
    emailPlaceholder: 'you@email.com',
    subscribe: 'اشتركي',
    privacy: 'لن نرسل إلا ما يستحق أن يصلك.',
    footerRights: '© 2026 Miee. صنع بحب.',
    searchComingSoon: 'سيتم إطلاق البحث قريباً ✦',
    bagEmpty: 'حقيبتك ما زالت فارغة',
    addedToast: 'تمت إضافته إلى السلة',
    filterShowing: 'عرض:',
    newsletterThanks: 'شكراً! أصبحتِ ضمن دائرة Miee.',
    search: {
      title: 'البحث في المتجر',
      placeholder: 'ابحثي عن عباية، طقم، فستان، لون، أو مقاس...',
      quickSuggestions: 'أكثر ما تبحث عنه عميلاتنا:',
      suggestions: ['عباية نُور', 'طقم سَما', 'فستان لِين', 'أسود ليلي', 'بيج رملي', 'جديد'],
      resultsCount: 'قطعة متطابقة',
      noResults: 'لم نجد أي قطعة تطابق بحثكِ',
      noResultsHint: 'جرّبي البحث بكلمات أخرى مثل اسم الموديل، اللون، أو المقاس.',
      viewAllProducts: 'تصفح التشكيلة بالكامل',
      escHint: 'ESC للإغلاق',
      inStock: 'متوفر',
      outOfStock: 'نفدت الكمية',
      addToBag: 'إضافة للحقيبة'
    },
    productModal: {
      selectSize: 'اختاري المقاس المثالي:',
      selectColor: 'اختاري اللون:',
      quantity: 'الكمية المطلوبة:',
      addToBag: 'إضافة إلى حقيبة التسوق',
      orderNow: 'شراء سريع ومباشر',
      inStock: 'متوفر وجاهز للشحن الفوري',
      outOfStock: 'نفدت الكمية حالياً',
      outOfStockNotice: 'عذراً، هذا الموديل نفد من المخزون حالياً ولا يمكن طلبه.',
      features: [
        'توصيل سريع وموثوق إلى 58 ولاية',
        'الدفع نقداً عند استلام ومعاينة الطلب',
        'إمكانية الاستبدال السهل خلال 15 يوماً'
      ],
      galleryHint: 'انقري على أي صورة لتكبيرها واستعراض التفاصيل',
      detailsTitle: 'تفاصيل الموديل والجودة',
      close: 'إغلاق'
    },
    cart: {
      title: 'سلتكِ <span>الأنيقة.</span>',
      itemCount: 'قطعة',
      emptyTitle: 'سلتكِ بانتظار لمستك.',
      emptyDesc: 'اكتشفي قطع Miee المختارة بعناية، ثم عودي هنا لإتمام طلبك.',
      emptyAction: 'اكتشفي المجموعة',
      checkoutEyebrow: 'تفاصيل الطلب',
      checkoutHeading: 'أكملي <span>إطلالتكِ.</span>',
      deliveryMethod: 'طريقة الاستلام',
      office: 'التوصيل للمكتب',
      officeDesc: 'استلام من مكتب الشحن',
      home: 'التوصيل للمنزل',
      homeDesc: 'إلى عنوانك مباشرة',
      wilaya: 'الولاية',
      wilayaPrompt: 'اختاري ولايتك',
      address: 'العنوان التفصيلي',
      addressPlaceholder: 'الحي، الشارع، رقم المنزل',
      name: 'الاسم الكامل',
      namePlaceholder: 'الاسم كما في بطاقة الهوية',
      phone: 'رقم الهاتف',
      phonePlaceholder: '05 / 06 / 07 XX XX XX XX',
      subtotal: 'مجموع المنتجات',
      shipping: 'سعر التوصيل',
      shippingSelectWilaya: 'اختاري الولاية',
      total: 'المجموع الإجمالي',
      placeOrder: 'اطلبي الآن',
      orderHint: 'بالضغط على الطلب، سنراجع التفاصيل ونتصل بكِ للتأكيد.',
      backToShop: 'مواصلة التسوق',
      secureDelivery: '✦ دفع آمن عند الاستلام',
      assurances: [
        'الدفع عند الاستلام',
        'توصيل إلى 58 ولاية',
        'تبديل سهل خلال 15 يوماً'
      ],
      successEyebrow: 'MIEE SAYS THANK YOU',
      successHeading: 'تم إرسال<br><span>طلبكِ بنجاح.</span>',
      successDesc: 'سنقوم بالاتصال بكِ في أقرب وقت لتأكيد الطلب وموعد التوصيل.',
      successAction: 'العودة للتسوق',
      remove: 'حذف'
    }
  },
  en: {
    dir: 'ltr',
    title: 'Miee — Elegance, quietly spoken',
    announcements: [
      'Fast delivery across 58 wilayas',
      'Cash on delivery',
      'Easy exchanges within 15 days'
    ],
    nav: {
      new: 'New in',
      collections: 'Collections',
      story: 'Our story',
      reviews: 'Client notes'
    },
    menuHead: 'MENU',
    menuLinks: ['Latest pieces', 'Collections', 'About Miee', 'Client notes'],
    menuNote: 'Thoughtful simplicity,<br>an elegance that stays with you.',
    heroEyebrow: "ATELIER D'ÉLÉGANCE",
    heroHeading: 'Miee Closet',
    heroText: 'A curated atelier of quiet elegance, crafted to accompany you in every moment.',
    discover: 'Discover the collection',
    weekEdit: 'THIS WEEK’S EDIT',
    closetHeading: 'A small wardrobe.<br>Endless <span>possibilities.</span>',
    viewAll: 'View all',
    categories: {
      abayas: 'Abayas',
      everyday: 'Everyday looks',
      details: 'The details'
    },
    categoryPieces: ['03 pieces', '12 pieces', '08 pieces'],
    freshEyebrow: 'JUST ARRIVED',
    productsHeading: 'Pieces you will <span>love.</span>',
    filters: {
      all: 'All',
      abayas: 'Abayas',
      sets: 'Sets',
      dresses: 'Dresses'
    },
    productNames: {
      noor: 'Noor Abaya',
      sama: 'Sama Set',
      lina: 'Lina Dress',
      mada: 'Mada Jacket'
    },
    productShades: {
      noor: 'Midnight black',
      sama: 'Sand beige',
      lina: 'Mocha brown',
      mada: 'Smoky grey'
    },
    addToBag: 'Add to bag',
    tags: {
      new: 'NEW',
      bestseller: 'BESTSELLER'
    },
    manifestoEyebrow: 'OUR PHILOSOPHY',
    manifestoHeading: 'We design for the woman who knows presence needs no noise.',
    manifestoText: 'At Miee, we believe a good piece feels like yours from the very first wear. We choose every fabric, cut and detail with comfort and beauty in equal measure.',
    manifestoMore: 'Get to know us',
    values: ['Thoughtful details', 'Soft fabrics', 'Lasting elegance'],
    reviewsEyebrow: 'FROM YOUR NOTES',
    reviewsHeading: 'Your words are <span>our story.</span>',
    reviews: [
      '“I was hesitant about sizing, but the fit was absolutely immaculate. Fast delivery straight to my doorstep, and the shopping experience was effortless.”',
      '“Customer care was exceptionally professional. They guided me to the perfect size and my order arrived in just two days.”',
      '“Wonderful, ma sha Allah!”'
    ],
    verified: 'Verified client',
    guarantee: {
      badgeDays: '58',
      badgeUnit: 'WILAYAS',
      title: 'Quality & Perfect Fit Guarantee Delivery to all 58 Wilayas',
      desc: 'Your trust is our top priority. We guarantee a fast, same-day exchange upon delivery for any sizing or fabric concerns, along with reliable shipping straight to your doorstep across all 58 wilayas. Shop with complete peace of mind and confidence. ✨'
    },
    newsletterEyebrow: 'A LITTLE NOTE, JUST FOR YOU',
    newsletterHeading: 'Be first<br>to know <span>what’s new.</span>',
    emailLabel: 'Your email address',
    emailPlaceholder: 'you@email.com',
    subscribe: 'Subscribe',
    privacy: 'Only the things worth receiving.',
    footerRights: '© 2026 Miee. Made with care.',
    searchComingSoon: 'Search is coming soon ✦',
    bagEmpty: 'Your bag is still empty',
    addedToast: 'Added to your bag',
    filterShowing: 'Showing:',
    newsletterThanks: 'Thank you! You are now part of Miee.',
    search: {
      title: 'Search Store',
      placeholder: 'Search for abaya, set, dress, color, size...',
      quickSuggestions: 'Popular searches:',
      suggestions: ['Noor Abaya', 'Sama Set', 'Lina Dress', 'Midnight Black', 'Sand Beige', 'New'],
      resultsCount: 'matching items',
      noResults: 'No items match your search',
      noResultsHint: 'Try searching by piece name, shade, or size.',
      viewAllProducts: 'Browse full collection',
      escHint: 'ESC to close',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      addToBag: 'Add to Bag'
    },
    productModal: {
      selectSize: 'Select Size:',
      selectColor: 'Select Color:',
      quantity: 'Quantity:',
      addToBag: 'Add to Bag',
      orderNow: 'Order Now',
      inStock: 'In Stock & Ready to Ship',
      outOfStock: 'Currently Out of Stock',
      outOfStockNotice: 'Sorry, this piece is currently out of stock and cannot be ordered.',
      features: [
        'Fast shipping to all 58 Wilayas',
        'Cash on Delivery after inspection',
        'Hassle-free 15-day exchanges'
      ],
      galleryHint: 'Click any image to view in high resolution',
      detailsTitle: 'Piece Details & Craftsmanship',
      close: 'Close'
    },
    cart: {
      title: 'Your <span>selection.</span>',
      itemCount: 'pieces',
      emptyTitle: 'Your bag awaits your touch.',
      emptyDesc: 'Discover carefully selected Miee pieces, then return to complete your order.',
      emptyAction: 'Discover the collection',
      checkoutEyebrow: 'ORDER DETAILS',
      checkoutHeading: 'Complete <span>your look.</span>',
      deliveryMethod: 'Delivery Method',
      office: 'Office Pickup',
      officeDesc: 'Pickup at shipping agency',
      home: 'Home Delivery',
      homeDesc: 'Directly to your doorstep',
      wilaya: 'Wilaya (Province)',
      wilayaPrompt: 'Select your wilaya',
      address: 'Detailed Address',
      addressPlaceholder: 'Street, neighborhood, house number',
      name: 'Full Name',
      namePlaceholder: 'Full name as on ID card',
      phone: 'Phone Number',
      phonePlaceholder: '05 / 06 / 07 XX XX XX XX',
      subtotal: 'Items Subtotal',
      shipping: 'Shipping Fee',
      shippingSelectWilaya: 'Select wilaya',
      total: 'Total Amount',
      placeOrder: 'Place Order Now',
      orderHint: 'By placing the order, we will review the details and call you to confirm.',
      backToShop: 'Continue shopping',
      secureDelivery: '✦ Secure Cash on Delivery',
      assurances: [
        'Cash on Delivery',
        'Delivery to 58 Wilayas',
        'Easy 15-day exchanges'
      ],
      successEyebrow: 'MIEE SAYS THANK YOU',
      successHeading: 'Order placed<br><span>successfully.</span>',
      successDesc: 'We will call you shortly to confirm your order and delivery timing.',
      successAction: 'Back to shopping',
      remove: 'Remove'
    }
  },
  fr: {
    dir: 'ltr',
    title: 'Miee — L’élégance en douceur',
    announcements: [
      'Livraison rapide dans 58 wilayas',
      'Paiement à la livraison',
      'Échange facile sous 15 jours'
    ],
    nav: {
      new: 'Nouveautés',
      collections: 'Collections',
      story: 'Notre histoire',
      reviews: 'Vos avis'
    },
    menuHead: 'MENU',
    menuLinks: ['Dernières pièces', 'Collections', 'À propos de Miee', 'Vos avis'],
    menuNote: 'Une simplicité réfléchie,<br>une élégance qui reste.',
    heroEyebrow: "ATELIER D'ÉLÉGANCE",
    heroHeading: 'Miee Closet',
    heroText: "Un atelier d'élégance discrète et de pièces raffinées, pensé pour sublimer votre quotidien.",
    discover: 'Découvrir la collection',
    weekEdit: 'SÉLECTION DE LA SEMAINE',
    closetHeading: 'Un petit dressing.<br>De grandes <span>possibilités.</span>',
    viewAll: 'Voir tout',
    categories: {
      abayas: 'Abayas',
      everyday: 'Looks du quotidien',
      details: 'Les détails'
    },
    categoryPieces: ['03 pièces', '12 pièces', '08 pièces'],
    freshEyebrow: 'NOUVEAUTÉS',
    productsHeading: 'Les pièces qu’il vous <span>faut.</span>',
    filters: {
      all: 'Tout',
      abayas: 'Abayas',
      sets: 'Ensembles',
      dresses: 'Robes'
    },
    productNames: {
      noor: 'Abaya Noor',
      sama: 'Ensemble Sama',
      lina: 'Robe Lina',
      mada: 'Veste Mada'
    },
    productShades: {
      noor: 'Noir de minuit',
      sama: 'Beige sable',
      lina: 'Marron moka',
      mada: 'Gris fumé'
    },
    addToBag: 'Ajouter au panier',
    tags: {
      new: 'NOUVEAU',
      bestseller: 'COUP DE CŒUR'
    },
    manifestoEyebrow: 'NOTRE PHILOSOPHIE',
    manifestoHeading: 'Nous créons pour la femme qui sait que sa présence n’a pas besoin de bruit.',
    manifestoText: 'Chez Miee, nous pensons qu’une belle pièce doit sembler vôtre dès le premier essayage. Nous choisissons chaque tissu, chaque coupe et chaque détail avec autant d’attention pour le confort que pour la beauté.',
    manifestoMore: 'Mieux nous connaître',
    values: ['Détails réfléchis', 'Matières douces', 'Élégance durable'],
    reviewsEyebrow: 'VOS MOTS',
    reviewsHeading: 'Vos mots sont <span>notre histoire.</span>',
    reviews: [
      '“J’hésitais sur la taille, mais la coupe est tombée à la perfection. La livraison à domicile a été ultra-rapide et l’expérience très fluide.”',
      '“Un service client d’un grand professionnalisme qui m’a guidée pour la bonne taille, et commande reçue en seulement deux jours.”',
      '“Magnifique, machallah !”'
    ],
    verified: 'Cliente vérifiée',
    guarantee: {
      badgeDays: '58',
      badgeUnit: 'WILAYAS',
      title: "Garantie de qualité et d'ajustement parfait Livraison 58 Wilayas",
      desc: "Votre confiance est notre priorité absolue. Nous vous garantissons un échange rapide le jour même à la livraison pour tout souci de taille ou de tissu, ainsi qu'une livraison fiable directement à votre porte dans les 58 wilayas. Faites vos achats en toute sérénité et en toute confiance. ✨"
    },
    newsletterEyebrow: 'UN PETIT MOT, RIEN QUE POUR VOUS',
    newsletterHeading: 'Soyez la première<br>à tout <span>découvrir.</span>',
    emailLabel: 'Votre adresse e-mail',
    emailPlaceholder: 'you@email.com',
    subscribe: 'S’inscrire',
    privacy: 'Seulement ce qui mérite de vous parvenir.',
    footerRights: '© 2026 Miee. Créé avec soin.',
    searchComingSoon: 'La recherche arrive bientôt ✦',
    bagEmpty: 'Votre panier est vide',
    addedToast: 'Ajouté à votre panier',
    filterShowing: 'Affichage :',
    newsletterThanks: 'Merci ! Bienvenue dans l’univers Miee.',
    search: {
      title: 'Recherche Boutique',
      placeholder: 'Rechercher une abaya, ensemble, robe, couleur...',
      quickSuggestions: 'Recherches populaires :',
      suggestions: ['Abaya Noor', 'Ensemble Sama', 'Robe Lina', 'Noir', 'Beige', 'Nouveau'],
      resultsCount: 'pièce(s) trouvée(s)',
      noResults: 'Aucun article ne correspond à votre recherche',
      noResultsHint: 'Essayez de chercher par nom de modèle, couleur ou taille.',
      viewAllProducts: 'Voir toute la collection',
      escHint: 'ESC pour fermer',
      inStock: 'En stock',
      outOfStock: 'Épuisé',
      addToBag: 'Ajouter au panier'
    },
    productModal: {
      selectSize: 'Choisissez la taille :',
      selectColor: 'Choisissez la couleur :',
      quantity: 'Quantité :',
      addToBag: 'Ajouter au panier',
      orderNow: 'Commander directement',
      inStock: 'En stock & Prêt à être expédié',
      outOfStock: 'Actuellement en rupture de stock',
      outOfStockNotice: 'Désolé, cette pièce est actuellement épuisée et ne peut être commandée.',
      features: [
        'Livraison rapide vers les 58 Wilayas',
        'Paiement à la livraison après vérification',
        'Échanges faciles sous 15 jours'
      ],
      galleryHint: 'Cliquez sur une photo pour l’agrandir en haute résolution',
      detailsTitle: 'Détails de la pièce & Confection',
      close: 'Fermer'
    },
    cart: {
      title: 'Votre <span>panier.</span>',
      itemCount: 'articles',
      emptyTitle: 'Votre panier attend votre touche.',
      emptyDesc: 'Découvrez les pièces soigneusement sélectionnées par Miee, puis revenez ici pour finaliser votre commande.',
      emptyAction: 'Découvrir la collection',
      checkoutEyebrow: 'DÉTAILS DE LA COMMANDE',
      checkoutHeading: 'Complétez <span>votre tenue.</span>',
      deliveryMethod: 'Mode de livraison',
      office: 'Livraison au bureau',
      officeDesc: 'Retrait au bureau de transport',
      home: 'Livraison à domicile',
      homeDesc: 'Directement chez vous',
      wilaya: 'Wilaya',
      wilayaPrompt: 'Choisissez votre wilaya',
      address: 'Adresse détaillée',
      addressPlaceholder: 'Quartier, rue, numéro de porte',
      name: 'Nom complet',
      namePlaceholder: 'Nom et prénom comme sur la carte',
      phone: 'Numéro de téléphone',
      phonePlaceholder: '05 / 06 / 07 XX XX XX XX',
      subtotal: 'Sous-total des articles',
      shipping: 'Frais de livraison',
      shippingSelectWilaya: 'Sélectionnez la wilaya',
      total: 'Total de la commande',
      placeOrder: 'Commander maintenant',
      orderHint: 'En confirmant, nous vérifierons les détails et vous appellerons pour validation.',
      backToShop: 'Continuer vos achats',
      secureDelivery: '✦ Paiement sécurisé à la livraison',
      assurances: [
        'Paiement à la livraison',
        'Livraison dans 58 wilayas',
        'Échange facile sous 15 jours'
      ],
      successEyebrow: 'MIEE VOUS REMERCIE',
      successHeading: 'Commande envoyée<br><span>avec succès.</span>',
      successDesc: 'Nous vous contacterons très prochainement pour confirmer la commande et la livraison.',
      successAction: 'Retour à la boutique',
      remove: 'Supprimer'
    }
  }
};
