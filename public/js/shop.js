/* =========================================================
   Gymmy – shop
   Product grid with a type filter, a cart drawer saved in
   localStorage, and a quick checkout with a success screen.
   Plugs into app.js through window.GymmyApp (loaded first).
   ========================================================= */
(function () {
  'use strict';

  const App = window.GymmyApp;
  const { PRODUCTS, PRODUCT_TYPES, CHECKOUT } = window.GYMMY_DATA;
  const { t, tp, L, esc, num, icon, toast, announce, refocus, storage } = App;

  const MAX_QTY = 10;
  const FILTERS = ['all'].concat(PRODUCT_TYPES);
  const productById = new Map(PRODUCTS.map((p) => [p.id, p]));

  const $ = (sel, root) => (root || document).querySelector(sel);

  const els = {
    filters: $('#shopFilters'),
    count: $('#productCount'),
    grid: $('#productGrid'),
    cartBtn: $('#cartBtn'),
    cartCount: $('#cartCount'),
    cart: $('#cart'),
    cartInner: $('#cartInner'),
    checkout: $('#checkout'),
    checkoutInner: $('#checkoutInner'),
  };

  const clampQty = (qty) => Math.min(MAX_QTY, Math.max(1, Math.round(Number(qty)) || 1));

  // Saved cart, minus anything that is no longer sold.
  function loadCart() {
    const saved = storage.get('cart', []);
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((item) => item && productById.has(item.id))
      .map((item) => ({ id: item.id, qty: clampQty(item.qty) }));
  }

  const state = {
    filter: 'all',
    cart: loadCart(),
  };

  const checkout = {
    step: 'form',    // form | done
    name: '',
    phone: '',
    method: 'mada',
    order: null,
  };

  /* ---------- Money ---------- */
  const amount = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(2));

  // "49 ر.س" / "SAR 49". The HTML version styles the number and currency separately.
  function money(value, html) {
    if (!html) return t('shop.price', { n: amount(value) });
    const [before, after] = t('shop.price').split('{n}');
    const currency = (text) => (text.trim() ? `<span class="price__cur">${esc(text.trim())}</span>` : '');
    return `<span class="price">${currency(before)}${num(amount(value))}${currency(after)}</span>`;
  }

  function totals() {
    const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + productById.get(item.id).price * item.qty, 0);
    // Prices are all-inclusive, so the total equals the subtotal.
    // Add shipping, discounts or fees here if that changes.
    return { count, subtotal, total: subtotal };
  }

  /* ---------- Store view ---------- */
  function renderFilters() {
    els.filters.innerHTML = FILTERS.map((filter) => {
      const count = filter === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.type === filter).length;
      return `<button type="button" class="chip" data-action="shop-filter" data-value="${filter}" aria-pressed="${state.filter === filter}">${esc(t('shop.filters.' + filter))}<span class="chip__count">${num(count)}</span></button>`;
    }).join('');
  }

  function productCard(p) {
    const specs = p.specs.map((spec) => {
      const [label, value] = L(spec);
      return `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
    }).join('');

    return `
      <article class="product">
        <span class="badge" data-category="${p.category}">${esc(t('shop.categories.' + p.category))}</span>
        <h3 class="product__name" id="product-${p.id}">${esc(L(p.name))}</h3>
        <p class="product__desc">${esc(L(p.desc))}</p>
        <dl class="specs">${specs}</dl>
        <div class="product__foot">
          ${money(p.price, true)}
          <button type="button" class="btn btn--dark product__add" data-action="cart-add" data-id="${p.id}" aria-describedby="product-${p.id}">${icon('plus')}<span>${esc(t('shop.addToCart'))}</span></button>
        </div>
      </article>`;
  }

  function renderStore() {
    const list = PRODUCTS.filter((p) => state.filter === 'all' || p.type === state.filter);
    els.count.innerHTML = tp('products', list.length, true);
    els.grid.innerHTML = list.map(productCard).join('');
  }

  function setFilter(value) {
    state.filter = value;
    els.filters.querySelectorAll('.chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.value === value));
    });
    renderStore();
  }

  /* ---------- Cart ---------- */
  function saveCart() {
    storage.set('cart', state.cart);
  }

  function updateBadge() {
    const { count } = totals();
    els.cartCount.hidden = count === 0;
    els.cartCount.textContent = count > 99 ? '99+' : String(count);
    els.cartBtn.setAttribute('aria-label', count ? t('shop.cartButton', { count: tp('products', count) }) : t('shop.cartTitle'));
  }

  function bumpBadge() {
    els.cartCount.classList.remove('is-bumping');
    void els.cartCount.offsetWidth; // restart the animation
    els.cartCount.classList.add('is-bumping');
  }

  function commit() {
    saveCart();
    updateBadge();
    if (els.cart.open) renderCart();
  }

  function addToCart(id, button) {
    const item = state.cart.find((entry) => entry.id === id);
    if (item && item.qty >= MAX_QTY) {
      toast(t('shop.maxQty', { n: MAX_QTY }));
      return;
    }
    if (item) item.qty += 1;
    else state.cart.push({ id, qty: 1 });
    commit();
    bumpBadge();
    toast(t('shop.addedToast'));
    if (button) flashAdded(button);
  }

  // Briefly turns the button into "Added" with a check mark.
  const addedTimers = new WeakMap();
  function flashAdded(button) {
    const label = button.querySelector('span');
    clearTimeout(addedTimers.get(button));
    button.classList.add('is-added');
    button.querySelector('use').setAttribute('href', '#i-check');
    label.textContent = t('shop.added');
    addedTimers.set(button, setTimeout(() => {
      button.classList.remove('is-added');
      button.querySelector('use').setAttribute('href', '#i-plus');
      label.textContent = t('shop.addToCart');
    }, 1400));
  }

  function changeQty(id, delta) {
    const item = state.cart.find((entry) => entry.id === id);
    if (!item) return;
    item.qty = clampQty(item.qty + delta);
    commit();
    announce(t('shop.quantityNow', { n: item.qty }));
    // Keep focus on the stepper; if this button just became disabled, use the other one.
    const own = delta > 0 ? 'cart-inc' : 'cart-dec';
    const other = delta > 0 ? 'cart-dec' : 'cart-inc';
    focusInCart(`[data-action="${own}"][data-id="${id}"]`, `[data-action="${other}"][data-id="${id}"]`);
  }

  function removeItem(id) {
    const index = state.cart.findIndex((entry) => entry.id === id);
    if (index === -1) return;
    state.cart.splice(index, 1);
    commit();
    toast(t('shop.removedToast'));
    const next = state.cart[Math.min(index, state.cart.length - 1)];
    focusInCart(next ? `[data-action="cart-remove"][data-id="${next.id}"]` : '[data-action="cart-browse"]');
  }

  function focusInCart(selector, fallback) {
    const target = [selector, fallback].filter(Boolean)
      .map((sel) => $(sel, els.cartInner))
      .find((el) => el && !el.disabled);
    (target || $('#cartTitle', els.cartInner)).focus({ preventScroll: true });
  }

  function cartItem(item) {
    const p = productById.get(item.id);
    const name = L(p.name);
    return `
      <li class="cart-item">
        <div class="cart-item__main">
          <span class="badge" data-category="${p.category}">${esc(t('shop.categories.' + p.category))}</span>
          <p class="cart-item__name">${esc(name)}</p>
          <p class="cart-item__unit">${esc(t('shop.each', { price: money(p.price) }))}</p>
        </div>
        <p class="cart-item__total">${money(p.price * item.qty, true)}</p>
        <div class="cart-item__actions">
          <div class="qty" role="group" aria-label="${esc(t('shop.quantity', { name }))}">
            <button type="button" class="qty__btn" data-action="cart-dec" data-id="${p.id}" aria-label="${esc(t('shop.decrease'))}"${item.qty <= 1 ? ' disabled' : ''}>${icon('minus')}</button>
            <span class="qty__value">${num(item.qty)}</span>
            <button type="button" class="qty__btn" data-action="cart-inc" data-id="${p.id}" aria-label="${esc(t('shop.increase'))}"${item.qty >= MAX_QTY ? ' disabled' : ''}>${icon('plus')}</button>
          </div>
          <button type="button" class="link-btn link-btn--muted" data-action="cart-remove" data-id="${p.id}" aria-label="${esc(t('shop.removeLabel', { name }))}">${esc(t('shop.remove'))}</button>
        </div>
      </li>`;
  }

  function renderCart() {
    const { count, subtotal, total } = totals();
    const head = `
      <header class="drawer__head">
        <div class="drawer__heading">
          <h2 class="drawer__title" id="cartTitle" tabindex="-1">${esc(t('shop.cartTitle'))}</h2>
          ${count ? `<span class="drawer__count">${tp('products', count, true)}</span>` : ''}
        </div>
        <button type="button" class="icon-btn" data-action="cart-close" aria-label="${esc(t('close'))}">${icon('close')}</button>
      </header>`;

    const body = count ? `
      <ul class="cart-list">${state.cart.map(cartItem).join('')}</ul>
      <footer class="drawer__foot">
        <dl class="totals">
          <div><dt>${esc(t('shop.subtotal'))}</dt><dd>${money(subtotal, true)}</dd></div>
          <div class="totals__grand"><dt>${esc(t('shop.total'))}</dt><dd>${money(total, true)}</dd></div>
        </dl>
        <p class="totals__note">${esc(t('shop.priceNote'))}</p>
        <button type="button" class="btn btn--primary btn--lg btn--block" data-action="checkout-open"><span>${esc(t('shop.checkout'))}</span>${icon('next', 'i--flip')}</button>
      </footer>` : `
      <div class="empty empty--drawer">
        ${icon('bag', 'empty__icon')}
        <h3 class="empty__title">${esc(t('shop.cartEmpty'))}</h3>
        <p class="empty__text">${esc(t('shop.cartEmptyHint'))}</p>
        <button type="button" class="btn btn--primary" data-action="cart-browse">${esc(t('shop.browse'))}</button>
      </div>`;

    els.cartInner.innerHTML = head + body;
  }

  let cartReturnFocus = null;
  let handingOff = false; // true while the cart closes to open checkout

  function openCart(returnTo) {
    renderCart();
    if (!els.cart.open) {
      cartReturnFocus = returnTo || document.activeElement;
      els.cart.showModal();
    }
    $('#cartTitle', els.cartInner).focus({ preventScroll: true });
  }

  function closeCart() {
    if (els.cart.open) els.cart.close();
  }

  /* ---------- Checkout ---------- */
  // Accepts 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX or 009665XXXXXXXX, in Western or Arabic digits.
  function normalizePhone(value) {
    const digits = String(value)
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
      .replace(/[\s\-().]/g, '');
    const match = digits.match(/^(?:\+?966|00966)?0?(5\d{8})$/);
    return match ? '0' + match[1] : null;
  }

  function orderNumber() {
    let n;
    try {
      n = crypto.getRandomValues(new Uint32Array(1))[0];
    } catch (e) {
      n = Math.floor(Math.random() * 4294967296);
    }
    return `${CHECKOUT.orderPrefix}-${100000 + (n % 900000)}`;
  }

  function demoNote(key) {
    return CHECKOUT.demo ? `<p class="demo-note">${icon('alert')}<span>${esc(t(key))}</span></p>` : '';
  }

  function checkoutForm() {
    const { total } = totals();
    const lines = state.cart.map((item) => {
      const p = productById.get(item.id);
      return `<li><span>${esc(L(p.name))} <span class="mini-lines__qty">× ${num(item.qty)}</span></span>${money(p.price * item.qty, true)}</li>`;
    }).join('');
    const method = (value) => `
      <label class="pay__option">
        <input type="radio" name="pay" value="${value}"${checkout.method === value ? ' checked' : ''}>
        <span class="pay__name pay__name--${value}">${esc(t('shop.methods.' + value))}</span>
        <span class="pay__hint">${esc(t('shop.methodHints.' + value))}</span>
      </label>`;

    return `
      <header class="modal-head">
        <button type="button" class="icon-btn" data-action="checkout-back" aria-label="${esc(t('shop.backToCart'))}">${icon('back', 'i--flip')}</button>
        <h2 class="modal-head__title" id="checkoutTitle" tabindex="-1">${esc(t('shop.checkoutTitle'))}</h2>
        <button type="button" class="icon-btn" data-action="checkout-close" aria-label="${esc(t('close'))}">${icon('close')}</button>
      </header>
      <form class="checkout" id="checkoutForm" novalidate>
        <ul class="mini-lines">
          ${lines}
          <li class="mini-lines__total"><span>${esc(t('shop.total'))}</span>${money(total, true)}</li>
        </ul>
        <div class="field">
          <label class="field__label" for="coName">${esc(t('shop.name'))}</label>
          <input class="input" id="coName" name="name" type="text" autocomplete="name" required value="${esc(checkout.name)}" aria-describedby="coNameError">
          <p class="field__error" id="coNameError" hidden></p>
        </div>
        <div class="field">
          <label class="field__label" for="coPhone">${esc(t('shop.phone'))}</label>
          <input class="input input--ltr" id="coPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" dir="ltr" placeholder="05XXXXXXXX" required value="${esc(checkout.phone)}" aria-describedby="coPhoneHint coPhoneError">
          <p class="field__hint" id="coPhoneHint">${esc(t('shop.phoneHint'))}</p>
          <p class="field__error" id="coPhoneError" hidden></p>
        </div>
        <fieldset class="pay">
          <legend class="field__label">${esc(t('shop.payment'))}</legend>
          <div class="pay__options">${method('mada')}${method('applepay')}</div>
        </fieldset>
        ${demoNote('shop.demoNote')}
        <button type="submit" class="btn btn--primary btn--lg btn--block checkout__submit"><span>${esc(t('shop.pay', { total: money(total) }))}</span></button>
      </form>`;
  }

  // Small paper pieces that burst out from behind the check mark.
  function confetti() {
    const colors = ['var(--lime)', 'var(--ink)', 'var(--back-fg)', 'var(--glutes-fg)', 'var(--core-fg)', 'var(--legs-fg)'];
    const pieces = Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * Math.PI * 2;
      const distance = 80 + (i % 3) * 28;
      const x = Math.round(Math.cos(angle) * distance);
      const y = Math.round(Math.sin(angle) * distance);
      return `<i style="--x: ${x}px; --y: ${y}px; --r: ${(i * 53) % 360}deg; --c: ${colors[i % colors.length]}; --d: ${(i % 4) * 50}ms"></i>`;
    });
    return `<span class="confetti" aria-hidden="true">${pieces.join('')}</span>`;
  }

  function checkoutSuccess() {
    const { order } = checkout;
    return `
      <div class="success">
        <button type="button" class="icon-btn success__close" data-action="checkout-close" aria-label="${esc(t('close'))}">${icon('close')}</button>
        <div class="success__mark">${confetti()}${icon('check')}</div>
        <h2 class="success__title" id="checkoutTitle" tabindex="-1">${esc(t('shop.successTitle'))}</h2>
        <p class="success__text">${esc(t('shop.successText', { name: order.name }))}</p>
        <div class="order-no">
          <span class="order-no__label">${esc(t('shop.orderNumber'))}</span>
          <span class="order-no__value num" dir="ltr">${esc(order.number)}</span>
        </div>
        <dl class="receipt">
          <div><dt>${esc(t('shop.items'))}</dt><dd>${tp('products', order.count, true)}</dd></div>
          <div><dt>${esc(t('shop.paidWith'))}</dt><dd>${esc(t('shop.methods.' + order.method))}</dd></div>
          <div class="receipt__total"><dt>${esc(t('shop.total'))}</dt><dd>${money(order.total, true)}</dd></div>
        </dl>
        ${demoNote('shop.demoDone')}
        <button type="button" class="btn btn--primary btn--lg btn--block" data-action="checkout-done">${esc(t('shop.continueShopping'))}</button>
      </div>`;
  }

  function renderCheckout() {
    els.checkoutInner.innerHTML = checkout.step === 'done' ? checkoutSuccess() : checkoutForm();
  }

  function openCheckout() {
    if (!state.cart.length) return;
    checkout.step = 'form';
    checkout.order = null;
    handingOff = els.cart.open;
    closeCart();
    renderCheckout();
    els.checkout.showModal();
    els.checkout.scrollTop = 0;
    $('#checkoutTitle', els.checkoutInner).focus({ preventScroll: true });
  }

  function closeCheckout() {
    if (els.checkout.open) els.checkout.close();
  }

  function setFieldError(input, errorEl, key) {
    input.setAttribute('aria-invalid', String(Boolean(key)));
    errorEl.hidden = !key;
    errorEl.textContent = key ? t(key) : '';
  }

  function submitCheckout(form) {
    const nameInput = form.elements.name;
    const phoneInput = form.elements.phone;
    const name = nameInput.value.trim();
    const phone = normalizePhone(phoneInput.value);

    checkout.name = name;
    checkout.phone = phoneInput.value;
    checkout.method = form.elements.pay.value;

    const nameError = name.length < 2 ? 'shop.nameError' : null;
    const phoneError = !phoneInput.value.trim() ? 'shop.phoneEmpty' : (!phone ? 'shop.phoneError' : null);
    setFieldError(nameInput, $('#coNameError', form), nameError);
    setFieldError(phoneInput, $('#coPhoneError', form), phoneError);

    if (nameError || phoneError) {
      (nameError ? nameInput : phoneInput).focus();
      announce(t('shop.fixErrors'));
      return;
    }

    // Short confirming state so the tap feels acknowledged.
    const submit = $('.checkout__submit', form);
    submit.disabled = true;
    submit.classList.add('is-loading');
    submit.querySelector('span').textContent = t('shop.processing');
    setTimeout(() => placeOrder(name, phone), 900);
  }

  function placeOrder(name, phone) {
    if (!els.checkout.open) return; // closed while confirming: nothing is ordered
    const { count, total } = totals();
    checkout.order = { number: orderNumber(), name, phone, count, total, method: checkout.method };
    checkout.step = 'done';
    state.cart = [];
    commit();
    renderCheckout();
    els.checkout.scrollTop = 0;
    $('#checkoutTitle', els.checkoutInner).focus({ preventScroll: true });
    announce(`${t('shop.successTitle')} ${t('shop.orderNumber')}: ${checkout.order.number}`);
  }

  /* ---------- Events ---------- */
  function bindEvents() {
    els.cart.addEventListener('click', (e) => {
      if (e.target === els.cart) closeCart();
    });
    els.cart.addEventListener('close', () => {
      if (!handingOff) refocus(cartReturnFocus);
      handingOff = false;
      cartReturnFocus = null;
    });

    els.checkout.addEventListener('click', (e) => {
      if (e.target === els.checkout) closeCheckout();
    });
    els.checkout.addEventListener('close', () => {
      if (checkout.step === 'done') checkout.step = 'form';
      els.checkoutInner.innerHTML = '';
      if (!els.cart.open) els.cartBtn.focus({ preventScroll: true });
    });
    els.checkout.addEventListener('submit', (e) => {
      e.preventDefault();
      submitCheckout(e.target);
    });
    // Remember typed details so a language switch or reopening keeps them.
    els.checkout.addEventListener('input', (e) => {
      if (e.target.name === 'name') checkout.name = e.target.value;
      else if (e.target.name === 'phone') checkout.phone = e.target.value;
    });
    els.checkout.addEventListener('change', (e) => {
      if (e.target.name === 'pay') checkout.method = e.target.value;
    });

    // Keep the cart in sync across open tabs.
    window.addEventListener('storage', (e) => {
      if (e.key !== 'gymmy.cart') return;
      state.cart = loadCart();
      updateBadge();
      if (els.cart.open) renderCart();
    });
  }

  /* ---------- Register with the app ---------- */
  App.register({
    views: { store: renderStore },
    actions: {
      'shop-filter': (el) => setFilter(el.dataset.value),
      'cart-add': (el) => addToCart(el.dataset.id, el),
      'cart-open': () => openCart(),
      'cart-close': closeCart,
      'cart-inc': (el) => changeQty(el.dataset.id, 1),
      'cart-dec': (el) => changeQty(el.dataset.id, -1),
      'cart-remove': (el) => removeItem(el.dataset.id),
      'cart-browse': () => {
        closeCart();
        if (App.view === 'store') $('#store-title').focus({ preventScroll: true });
        else location.hash = 'store';
      },
      'checkout-open': openCheckout,
      'checkout-back': () => {
        closeCheckout();
        openCart(els.cartBtn);
      },
      'checkout-close': closeCheckout,
      'checkout-done': closeCheckout,
    },
    onLanguage: () => {
      renderFilters();
      if (App.view === 'store') renderStore();
      updateBadge();
      if (els.cart.open) renderCart();
      if (els.checkout.open) renderCheckout();
    },
  });

  renderFilters();
  updateBadge();
  bindEvents();
})();
