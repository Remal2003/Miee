import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'noor',
    name: 'عباية نُور',
    price: 6900,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'تصميم ناعم يجمع بين الانسيابية والفخامة الهادئة. صُممت بحب من قماش الكريب الملكي المريح، وتتألق بقَصّة واسعة تمنحكِ راحة مطلقة وحضوراً لافتاً في كافة المناسبات.',
    category: 'abayas',
    colors: ['أسود ليلي', 'بيج رملي', 'أخضر زيتوني'],
    sizes: ['S', 'M', 'L', 'XL'],
    tag: 'جديد',
    tagStyle: 'orange',
    inStock: true
  },
  {
    id: 'sama',
    name: 'طقم سَما',
    price: 7400,
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'طقم عصري متناسق يتكون من قطعتين بقَصّة هندسية راقية. خامة خفيفة وعملية تناسب يومكِ المليء بالحركة والنشاط دون التخلي عن الأناقة الراقية.',
    category: 'sets',
    colors: ['بيج رملي', 'أسود', 'كحلي'],
    sizes: ['S', 'M', 'L'],
    inStock: true
  },
  {
    id: 'lina',
    name: 'فستان لِين',
    price: 5800,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'فستان كلاسيكي انسيابي يتناغم مع جمال تفاصيلك. قماش ناعم الملمس بقَصّة تبرز رقي الإطلالة بأسلوب محتشم وجذاب.',
    category: 'dresses',
    colors: ['بني موكا', 'عنابي', 'رمادي'],
    sizes: ['S', 'M', 'L', 'XL'],
    tag: 'الأكثر طلباً',
    tagStyle: 'soft',
    inStock: true
  },
  {
    id: 'mada',
    name: 'جاكيت مَدى',
    price: 6200,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'جاكيت بتصميم مينيمالي وأكتاف منسدلة أنيقة. يضيف لمسة دفء عصرية فوق أي قطعة من خزانتكِ مع قصّة مريحة وعملية.',
    category: 'sets',
    colors: ['رمادي دخاني', 'أسود'],
    sizes: ['S', 'M', 'L'],
    inStock: true
  }
];
