import { Language } from '../../types';

export interface AdminTranslations {
  portalTitle: string;
  portalSubtitle: string;
  cloudSync: string;
  viewStore: string;
  logout: string;
  loginTitle: string;
  loginDesc: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  loginSubmit: string;
  rememberMe: string;
  loginDefaultNote: string;
  backToStore: string;
  loginError: string;
  tabs: {
    orders: string;
    products: string;
    shipping: string;
    newBadge: string;
  };
  metrics: {
    totalOrders: string;
    totalOrdersSub: string;
    pendingOrders: string;
    pendingOrdersSub: string;
    shippedOrders: string;
    shippedOrdersSub: string;
    totalRevenue: string;
    totalRevenueSub: string;
  };
  orders: {
    searchPlaceholder: string;
    filterAll: string;
    filterNew: string;
    filterConfirmed: string;
    filterShipped: string;
    filterCancelled: string;
    noOrders: string;
    homeDelivery: string;
    officeDelivery: string;
    addressLabel: string;
    colorLabel: string;
    sizeLabel: string;
    qtyLabel: string;
    orderedItemsTitle: string;
    itemTotalLabel: string;
    unitPriceLabel: string;
    totalToCollect: string;
    deleteConfirm: string;
    deleteBtn: string;
    statusNew: string;
    statusConfirmed: string;
    statusShipped: string;
    statusCancelled: string;
  };
  products: {
    addTitle: string;
    addDesc: string;
    nameLabel: string;
    namePlaceholder: string;
    priceLabel: string;
    categoryLabel: string;
    catAbayas: string;
    catSets: string;
    catDresses: string;
    sizesLabel: string;
    sizesPlaceholder: string;
    sizesHint: string;
    colorsLabel: string;
    colorsPlaceholder: string;
    imageLabel: string;
    imagePlaceholder: string;
    previewBadge: string;
    tagLabel: string;
    tagNone: string;
    tagNew: string;
    tagBestseller: string;
    tagPromo: string;
    submitBtn: string;
    savingBtn: string;
    successMsg: string;
    listTitle: string;
    listSub: string;
    sizesText: string;
    colorsText: string;
    deleteBtn: string;
    deleteConfirm: string;
  };
  shipping: {
    title: string;
    desc: string;
    freeAllBtn: string;
    freeAllConfirm: string;
    saveBtn: string;
    savingBtn: string;
    successMsg: string;
    searchPlaceholder: string;
    colCode: string;
    colName: string;
    colHome: string;
    colOffice: string;
    colFreeStatus: string;
    makeFree: string;
    isFree: string;
  };
}

export const ADMIN_TRANSLATIONS: Record<Language, AdminTranslations> = {
  ar: {
    portalTitle: 'لوحة تحكم الإدارة — Miee',
    portalSubtitle: 'لوحة إدارة المتجر والطلبيات',
    cloudSync: 'مزامنة سحابية حية (Firebase Live)',
    viewStore: '👁️ عرض المتجر للعملاء',
    logout: 'تسجيل الخروج',
    loginTitle: 'تسجيل دخول الإدارة',
    loginDesc: 'مساحة مخصصة للإدارة فقط لاستقبال وتتبع الطلبيات، إضافة الملابس، وضبط أسعار التوصيل.',
    emailLabel: 'البريد الإلكتروني أو اسم المستخدم',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    loginSubmit: 'دخول لوحة التحكم',
    rememberMe: 'تذكرني على هذا المتصفح',
    loginDefaultNote: '🔒 تسجيل دخول محمي وموثق عبر Firebase Authentication',
    backToStore: '← العودة لتصفح المتجر',
    loginError: 'تعذر تسجيل الدخول: البريد الإلكتروني أو كلمة المرور غير صحيحة، أو الحساب غير مسجل في Firebase.',
    tabs: {
      orders: '📦 الطلبيات الواردة',
      products: '👗 إدارة الملابس والكتالوج',
      shipping: '🚚 التحكم في أسعار الشحن (58 ولاية)',
      newBadge: 'جديد'
    },
    metrics: {
      totalOrders: 'إجمالي الطلبيات',
      totalOrdersSub: 'مسجلة في قاعدة البيانات',
      pendingOrders: 'طلبات بانتظار التأكيد',
      pendingOrdersSub: 'تحتاج اتصالاً وتأكيداً',
      shippedOrders: 'تم الشحن / التوصيل',
      shippedOrdersSub: 'جاهزة أو سلمت للمشتري',
      totalRevenue: 'إجمالي المبيعات (مع الشحن)',
      totalRevenueSub: 'القيمة الإجمالية للطلبات'
    },
    orders: {
      searchPlaceholder: 'ابحث برقم الطلب، اسم العميل، الهاتف، أو الولاية...',
      filterAll: 'جميع الطلبات',
      filterNew: 'جديدة',
      filterConfirmed: 'تم التأكيد',
      filterShipped: 'تم الشحن',
      filterCancelled: 'ملغاة',
      noOrders: 'لا توجد طلبات تطابق معايير البحث الحالية.',
      homeDelivery: 'توصيل منزلي',
      officeDelivery: 'استلام من المكتب',
      addressLabel: 'العنوان التفصيلي:',
      colorLabel: 'اللون:',
      sizeLabel: 'المقاس:',
      qtyLabel: 'الكمية:',
      orderedItemsTitle: 'القطع والمنتجات المطلوبة',
      itemTotalLabel: 'المجموع:',
      unitPriceLabel: 'للقطعة',
      totalToCollect: 'المبلغ الإجمالي للدفع',
      deleteConfirm: 'هل أنت متأكد من حذف هذا الطلب نهائياً؟',
      deleteBtn: 'حذف',
      statusNew: 'طلب جديد',
      statusConfirmed: 'تم التأكيد',
      statusShipped: 'تم الشحن',
      statusCancelled: 'ملغى'
    },
    products: {
      addTitle: 'إضافة قطعة ملابس جديدة',
      addDesc: 'حدد اسم القطعة، السعر، المقاسات، والألوان المتوفرة ليختار منها العميل في المتجر',
      nameLabel: 'اسم القطعة / الفستان / العباية',
      namePlaceholder: 'مثال: عباية نرجس الملكية',
      priceLabel: 'السعر بالدينار (دج)',
      categoryLabel: 'التصنيف',
      catAbayas: 'عبايات',
      catSets: 'أطقم',
      catDresses: 'فساتين',
      sizesLabel: 'المقاسات المتوفرة (مفصولة بفاصلة)',
      sizesPlaceholder: 'S, M, L, XL, XXL',
      sizesHint: 'سيتمكن العميل من اختيار مقاسه المفضل في السلة',
      colorsLabel: 'الألوان المتوفرة (مفصولة بفاصلة)',
      colorsPlaceholder: 'أسود ليلي, بيج رملي, كحلي',
      imageLabel: 'رابط صورة المنتج (URL)',
      imagePlaceholder: 'https://images.unsplash.com/...',
      previewBadge: 'معاينة الصورة الحية',
      tagLabel: 'شارة تمييز خاصة (اختياري)',
      tagNone: 'بدون شارة',
      tagNew: 'جديد',
      tagBestseller: 'الأكثر طلباً',
      tagPromo: 'تخفيض PROMO',
      submitBtn: '+ نشر وإضافة القطعة للمتجر ↙',
      savingBtn: 'جاري الحفظ في Firebase...',
      successMsg: '✓ تمت إضافة ونشر القطعة بنجاح في المتجر!',
      listTitle: 'الملابس المتوفرة حالياً بالمتجر',
      listSub: 'محدثة لحظياً مع العملاء',
      sizesText: 'المقاسات:',
      colorsText: 'الألوان:',
      deleteBtn: 'حذف',
      deleteConfirm: 'هل أنت متأكد من حذف هذه القطعة نهائياً من المتجر؟'
    },
    shipping: {
      title: 'التحكم في أسعار التوصيل لكافة الولايات (58 ولاية)',
      desc: 'عدل أسعار الشحن للمنزل أو للمكتب، أو قم بتفعيل التوصيل المجاني (0 دج) لتشجيع المبيعات.',
      freeAllBtn: 'توصيل مجاني للجميع (0 دج)',
      freeAllConfirm: 'هل تريد تفعيل الشحن المجاني (0 دج) لجميع الولايات الـ 58؟',
      saveBtn: 'حفظ التغييرات في Firebase ↙',
      savingBtn: 'جاري الحفظ...',
      successMsg: '✓ تم حفظ وتحديث أسعار التوصيل في قاعدة البيانات بنجاح!',
      searchPlaceholder: 'ابحث عن الولاية بالرقم أو الاسم (مثال: 16 أو الجزائر)...',
      colCode: 'رقم الولاية',
      colName: 'اسم الولاية',
      colHome: 'سعر التوصيل للمنزل (دج)',
      colOffice: 'سعر التوصيل للمكتب (دج)',
      colFreeStatus: 'حالة التوصيل المجاني',
      makeFree: 'تعيين مجاني',
      isFree: '✓ مجاني'
    }
  },
  en: {
    portalTitle: 'Admin Portal — Miee',
    portalSubtitle: 'Store Operations & Orders Management',
    cloudSync: 'Cloud Sync Active (Firebase Live)',
    viewStore: '👁️ View Live Storefront',
    logout: 'Sign Out',
    loginTitle: 'Admin Portal Login',
    loginDesc: 'Authorized access only to manage incoming customer orders, catalog pieces, and 58 wilayas shipping rates.',
    emailLabel: 'Email address or username',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    loginSubmit: 'Sign In to Dashboard',
    rememberMe: 'Remember me on this browser',
    loginDefaultNote: '🔒 Secured with Firebase Authentication',
    backToStore: '← Return to Storefront',
    loginError: 'Authentication failed: Invalid email or password, or user not found in Firebase.',
    tabs: {
      orders: '📦 Incoming Orders',
      products: '👗 Products & Catalog',
      shipping: '🚚 Shipping Rates (58 Wilayas)',
      newBadge: 'NEW'
    },
    metrics: {
      totalOrders: 'Total Orders',
      totalOrdersSub: 'Recorded in database',
      pendingOrders: 'Pending Confirmation',
      pendingOrdersSub: 'Requires phone confirmation',
      shippedOrders: 'Shipped / In Transit',
      shippedOrdersSub: 'Out for delivery or completed',
      totalRevenue: 'Total Revenue (with shipping)',
      totalRevenueSub: 'Gross registered sales'
    },
    orders: {
      searchPlaceholder: 'Search by order ID, customer name, phone, or wilaya...',
      filterAll: 'All Orders',
      filterNew: 'New',
      filterConfirmed: 'Confirmed',
      filterShipped: 'Shipped',
      filterCancelled: 'Cancelled',
      noOrders: 'No orders match your current search criteria.',
      homeDelivery: 'Home Delivery',
      officeDelivery: 'Office Pickup',
      addressLabel: 'Detailed Address:',
      colorLabel: 'Color:',
      sizeLabel: 'Size:',
      qtyLabel: 'Qty:',
      orderedItemsTitle: 'Ordered Items',
      itemTotalLabel: 'Total:',
      unitPriceLabel: 'per piece',
      totalToCollect: 'Total Amount to Collect',
      deleteConfirm: 'Are you sure you want to permanently delete this order?',
      deleteBtn: 'Delete',
      statusNew: 'New Order',
      statusConfirmed: 'Confirmed',
      statusShipped: 'Shipped',
      statusCancelled: 'Cancelled'
    },
    products: {
      addTitle: 'Add New Clothing Piece',
      addDesc: 'Specify item title, price, available sizes and colors for customers in the shop',
      nameLabel: 'Piece Name / Abaya / Dress',
      namePlaceholder: 'e.g. Royal Narjis Abaya',
      priceLabel: 'Price in DZD (دج)',
      categoryLabel: 'Category',
      catAbayas: 'Abayas',
      catSets: 'Sets',
      catDresses: 'Dresses',
      sizesLabel: 'Available Sizes (comma separated)',
      sizesPlaceholder: 'S, M, L, XL, XXL',
      sizesHint: 'Customers will be able to select their size in the cart',
      colorsLabel: 'Available Colors (comma separated)',
      colorsPlaceholder: 'Midnight black, Sand beige, Navy blue',
      imageLabel: 'Product Image URL',
      imagePlaceholder: 'https://images.unsplash.com/...',
      previewBadge: 'Live Image Preview',
      tagLabel: 'Special Badge (Optional)',
      tagNone: 'None',
      tagNew: 'NEW',
      tagBestseller: 'BESTSELLER',
      tagPromo: 'PROMO',
      submitBtn: '+ Publish Piece to Store ↙',
      savingBtn: 'Saving to Firebase...',
      successMsg: '✓ Product published successfully to the store!',
      listTitle: 'Active Store Catalog',
      listSub: 'Synchronized live with customers',
      sizesText: 'Sizes:',
      colorsText: 'Colors:',
      deleteBtn: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this piece from the store?'
    },
    shipping: {
      title: 'Manage Shipping Rates Across All 58 Wilayas',
      desc: 'Adjust home delivery and office pickup rates, or toggle free delivery (0 DZD) to boost sales.',
      freeAllBtn: 'Free Shipping for All (0 DZD)',
      freeAllConfirm: 'Do you want to enable free shipping (0 DZD) for all 58 wilayas?',
      saveBtn: 'Save Changes to Firebase ↙',
      savingBtn: 'Saving...',
      successMsg: '✓ Wilayas shipping rates updated successfully in database!',
      searchPlaceholder: 'Search by wilaya number or name (e.g. 16 or Alger)...',
      colCode: 'Code',
      colName: 'Wilaya Name',
      colHome: 'Home Delivery (DZD)',
      colOffice: 'Office Pickup (DZD)',
      colFreeStatus: 'Free Delivery',
      makeFree: 'Set Free',
      isFree: '✓ Free'
    }
  },
  fr: {
    portalTitle: 'Portail Administration — Miee',
    portalSubtitle: 'Gestion des opérations et des commandes',
    cloudSync: 'Synchronisation Cloud Active (Firebase Live)',
    viewStore: '👁️ Voir la boutique en direct',
    logout: 'Déconnexion',
    loginTitle: 'Connexion Administration',
    loginDesc: 'Accès réservé pour gérer les commandes entrantes, les vêtements et les tarifs de livraison dans les 58 wilayas.',
    emailLabel: 'Adresse e-mail ou identifiant',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: '••••••••',
    loginSubmit: 'Accéder au tableau de bord',
    rememberMe: 'Se souvenir de moi sur cet appareil',
    loginDefaultNote: '🔒 Connexion sécurisée avec Firebase Authentication',
    backToStore: '← Retour à la boutique',
    loginError: 'Échec de la connexion : e-mail ou mot de passe incorrect, ou compte inexistant dans Firebase.',
    tabs: {
      orders: '📦 Commandes reçues',
      products: '👗 Vêtements & Catalogue',
      shipping: '🚚 Frais de livraison (58 Wilayas)',
      newBadge: 'NOUVEAU'
    },
    metrics: {
      totalOrders: 'Total des commandes',
      totalOrdersSub: 'Enregistrées en base',
      pendingOrders: 'En attente de confirmation',
      pendingOrdersSub: 'Nécessite appel de confirmation',
      shippedOrders: 'Expédiées / En cours',
      shippedOrdersSub: 'En livraison ou terminées',
      totalRevenue: 'Revenu total (avec livraison)',
      totalRevenueSub: 'Ventes brutes enregistrées'
    },
    orders: {
      searchPlaceholder: 'Rechercher par n° de commande, nom, tél, ou wilaya...',
      filterAll: 'Toutes les commandes',
      filterNew: 'Nouvelles',
      filterConfirmed: 'Confirmées',
      filterShipped: 'Expédiées',
      filterCancelled: 'Annulées',
      noOrders: 'Aucune commande ne correspond à votre recherche.',
      homeDelivery: 'Livraison à domicile',
      officeDelivery: 'Retrait en bureau',
      addressLabel: 'Adresse détaillée :',
      colorLabel: 'Couleur :',
      sizeLabel: 'Taille :',
      qtyLabel: 'Qté :',
      orderedItemsTitle: 'Articles commandés',
      itemTotalLabel: 'Total :',
      unitPriceLabel: 'par pièce',
      totalToCollect: 'Montant total à encaisser',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer définitivement cette commande ?',
      deleteBtn: 'Supprimer',
      statusNew: 'Nouvelle commande',
      statusConfirmed: 'Confirmée',
      statusShipped: 'Expédiée',
      statusCancelled: 'Annulée'
    },
    products: {
      addTitle: 'Ajouter une nouvelle pièce',
      addDesc: 'Définissez le nom, prix, tailles et couleurs disponibles pour les clientes',
      nameLabel: 'Nom de la pièce / Abaya / Robe',
      namePlaceholder: 'ex : Abaya Narjis Royale',
      priceLabel: 'Prix en DZD (دج)',
      categoryLabel: 'Catégorie',
      catAbayas: 'Abayas',
      catSets: 'Ensembles',
      catDresses: 'Robes',
      sizesLabel: 'Tailles disponibles (séparées par virgule)',
      sizesPlaceholder: 'S, M, L, XL, XXL',
      sizesHint: 'La cliente pourra choisir sa taille dans le panier',
      colorsLabel: 'Couleurs disponibles (séparées par virgule)',
      colorsPlaceholder: 'Noir de minuit, Beige sable, Bleu marine',
      imageLabel: 'URL de l\'image du produit',
      imagePlaceholder: 'https://images.unsplash.com/...',
      previewBadge: 'Aperçu en direct de l\'image',
      tagLabel: 'Badge spécial (Optionnel)',
      tagNone: 'Aucun',
      tagNew: 'NOUVEAU',
      tagBestseller: 'COUP DE CŒUR',
      tagPromo: 'PROMO',
      submitBtn: '+ Publier la pièce en boutique ↙',
      savingBtn: 'Enregistrement dans Firebase...',
      successMsg: '✓ Pièce publiée avec succès dans la boutique !',
      listTitle: 'Catalogue actuel de la boutique',
      listSub: 'Synchronisé en direct avec les clientes',
      sizesText: 'Tailles :',
      colorsText: 'Couleurs :',
      deleteBtn: 'Supprimer',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette pièce de la boutique ?'
    },
    shipping: {
      title: 'Gestion des tarifs de livraison (58 Wilayas)',
      desc: 'Modifiez les tarifs domicile et bureau, ou activez la livraison gratuite (0 DZD) pour stimuler les ventes.',
      freeAllBtn: 'Livraison gratuite pour tous (0 DZD)',
      freeAllConfirm: 'Voulez-vous activer la livraison gratuite (0 DZD) pour les 58 wilayas ?',
      saveBtn: 'Enregistrer dans Firebase ↙',
      savingBtn: 'Enregistrement...',
      successMsg: '✓ Tarifs de livraison mis à jour avec succès dans la base !',
      searchPlaceholder: 'Rechercher par numéro ou nom de wilaya (ex : 16 ou Alger)...',
      colCode: 'N°',
      colName: 'Wilaya',
      colHome: 'Livraison à domicile (DZD)',
      colOffice: 'Retrait au bureau (DZD)',
      colFreeStatus: 'Livraison gratuite',
      makeFree: 'Rendre gratuit',
      isFree: '✓ Gratuit'
    }
  }
};
