const cartStorageKey = 'miee-cart';
const readCart = () => JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
const writeCart = cart => localStorage.setItem(cartStorageKey, JSON.stringify(cart));
const refreshBag = () => { const total = readCart().reduce((sum, item) => sum + item.qty, 0); const badge = document.querySelector('.bag-btn b'); if (badge) badge.textContent = total; };
document.querySelectorAll('.quick-add').forEach(button => button.onclick = () => {
  const card = button.closest('.product-card'); const cart = readCart(); const existing = cart.find(item => item.id === card.dataset.id);
  if (existing) existing.qty += 1;
  else cart.push({id:card.dataset.id,name:card.querySelector('h3').textContent,price:Number(card.dataset.price),image:card.dataset.image,colors:card.dataset.colors.split('|'),sizes:card.dataset.sizes.split('|'),color:card.dataset.colors.split('|')[0],size:card.dataset.sizes.split('|')[1] || card.dataset.sizes.split('|')[0],qty:1});
  writeCart(cart); refreshBag();
  const toast = document.querySelector('.toast'); if (toast) { toast.textContent = `${button.dataset.add} — تمت إضافته إلى السلة`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); }
});
document.querySelector('[data-bag]').onclick = () => window.location.href = 'cart.html';
refreshBag();
