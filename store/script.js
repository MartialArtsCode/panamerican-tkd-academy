/* ── Cart State ──────────────────────────────────── */
var cart = JSON.parse(localStorage.getItem('pta_cart') || '[]');

/* ── Product Catalog ─────────────────────────────── */
var PRODUCTS = {
    'dobok': { name: 'Official Dobok', price: 65, icon: 'fas fa-tshirt', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    'hoodie': { name: 'Academy Hoodie', price: 35, icon: 'fas fa-vest', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
    'tshirt': { name: 'Academy T-Shirt', price: 25, icon: 'fas fa-tshirt', sizes: ['S', 'M', 'L', 'XL', 'XXL'] }
};

/* ── Persist Cart ────────────────────────────────── */
function saveCart() {
    localStorage.setItem('pta_cart', JSON.stringify(cart));
}

/* ── Find Cart Item ──────────────────────────────── */
function findItem(id, size) {
    return cart.find(function (i) { return i.id === id && i.size === size; });
}

/* ── Add to Cart ─────────────────────────────────── */
function addToCart(productId, size) {
    var product = PRODUCTS[productId];
    if (!product) return;

    var existing = findItem(productId, size);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: productId, name: product.name, price: product.price, size: size, qty: 1, icon: product.icon });
    }
    saveCart();
    updateCartUI();
    openCart();
}

/* ── Change Quantity ─────────────────────────────── */
function changeQty(productId, size, delta) {
    var item = findItem(productId, size);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(function (i) { return !(i.id === productId && i.size === size); });
    }
    saveCart();
    updateCartUI();
}

/* ── Remove Item ─────────────────────────────────── */
function removeItem(productId, size) {
    cart = cart.filter(function (i) { return !(i.id === productId && i.size === size); });
    saveCart();
    updateCartUI();
}

/* ── Update All Cart UI ──────────────────────────── */
function updateCartUI() {
    var totalQty = cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
    var totalPrice = cart.reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);

    // Badge
    var countEl = document.getElementById('cartCount');
    if (countEl) {
        countEl.textContent = totalQty;
        countEl.classList.toggle('visible', totalQty > 0);
    }

    // Items list
    var listEl = document.getElementById('cartItems');
    if (!listEl) return;

    if (cart.length === 0) {
        listEl.innerHTML =
            '<div class="cart-empty"><i class="fas fa-shopping-bag"></i>Your cart is empty</div>';
    } else {
        listEl.innerHTML = cart.map(function (item) {
            return (
                '<div class="cart-item">' +
                '<div class="cart-item-icon"><i class="' + item.icon + '"></i></div>' +
                '<div class="cart-item-details">' +
                '<div class="cart-item-name">' + item.name + '</div>' +
                '<div class="cart-item-meta">Size: ' + item.size + '</div>' +
                '<div class="cart-item-controls">' +
                '<button class="qty-btn" onclick="changeQty(\'' + item.id + '\',\'' + item.size + '\',-1)">−</button>' +
                '<span class="qty-value">' + item.qty + '</span>' +
                '<button class="qty-btn" onclick="changeQty(\'' + item.id + '\',\'' + item.size + '\',1)">+</button>' +
                '<button class="cart-item-remove" onclick="removeItem(\'' + item.id + '\',\'' + item.size + '\')" title="Remove"><i class="fas fa-trash-alt"></i></button>' +
                '</div>' +
                '</div>' +
                '<div class="cart-item-price">$' + (item.price * item.qty).toFixed(2) + '</div>' +
                '</div>'
            );
        }).join('');
    }

    // Total
    var totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = '$' + totalPrice.toFixed(2);
}

/* ── Cart Drawer Open/Close ──────────────────────── */
function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
}

/* ── Checkout (email intent) ─────────────────────── */
function checkout() {
    if (cart.length === 0) return;
    var lines = cart.map(function (i) {
        return i.qty + 'x ' + i.name + ' (Size: ' + i.size + ') - $' + (i.price * i.qty).toFixed(2);
    });
    var total = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    var body = 'Hi, I would like to order the following items:\n\n' +
        lines.join('\n') + '\n\nOrder Total: $' + total.toFixed(2);
    window.location.href = 'mailto:panamericantkd22@gmail.com' +
        '?subject=' + encodeURIComponent('PTA Store Order') +
        '&body=' + encodeURIComponent(body);
}

/* ── Size Button Selection ───────────────────────── */
function selectSize(btn, productId) {
    var group = btn.closest('.size-options');
    group.querySelectorAll('.size-btn').forEach(function (b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
}

/* ── Init on DOM Ready ───────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
    updateCartUI();

    document.getElementById('cartOverlay').addEventListener('click', closeCart);

    // Default-select first size for each product
    document.querySelectorAll('.size-options').forEach(function (group) {
        var first = group.querySelector('.size-btn');
        if (first) first.classList.add('selected');
    });
});
