console.log("Script работает!");

// Элементы модалки и интерфейса
const modal = document.getElementById("modal");
const img = document.getElementById("modal-image");
const title = document.getElementById("modal-title");
const desc = document.getElementById("modal-description");
const weight = document.getElementById("modal-weight");
const price = document.getElementById("modal-price");

const addToCartButton = document.getElementById("add-to-cart");
const cartContent = document.getElementById("cart-content");
const cartCount = document.getElementById("cart-count");
const cartButton = document.getElementById("cart-button");

const productContent = document.getElementById("product-content");

// =========================
// КОРЗИНА
// =========================

let cart = [];
let currentProduct = {};

// =========================
// ОТКРЫТИЕ БЛЮДА
// =========================

function openModal(image, name, description, grams, cost) {
    if (cartButton) cartButton.style.display = "none";
    if (productContent) productContent.style.display = "block";
    if (cartContent) cartContent.style.display = "none";

    if (img) img.src = image;
    if (title) title.innerText = name;
    if (desc) desc.innerText = description;
    if (weight) weight.innerText = grams;
    if (price) price.innerText = cost;

    currentProduct = {
        image: image,
        name: name,
        description: description,
        grams: grams,
        price: parsePrice(cost)
    };

    if (addToCartButton) addToCartButton.style.display = "block";
    if (modal) modal.style.display = "flex";
}

// =========================
// ДОБАВЛЕНИЕ ИЗ МОДАЛКИ В КОРЗИНУ
// =========================

if (addToCartButton) {
    addToCartButton.onclick = function () {
        const existingProduct = cart.find(
            item => item.name === currentProduct.name && item.grams === currentProduct.grams
        );

        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push({
                ...currentProduct,
                quantity: 1
            });
        }

        updateCart();

        if (modal) modal.style.display = "none";
        if (cartButton) cartButton.style.display = "block";
    };
}

// =========================
// ОБНОВЛЕНИЕ СЧЁТЧИКА И КНОПКИ
// =========================

function updateCart() {
    let totalQuantity = 0;

    cart.forEach(item => {
        totalQuantity += item.quantity;
    });

    if (cartCount) {
        cartCount.innerText = totalQuantity;
    }
}

// =========================
// ОТКРЫТИЕ КОРЗИНЫ
// =========================

function openCart() {
    if (cartButton) cartButton.style.display = "none";
    if (productContent) productContent.style.display = "none";
    if (cartContent) cartContent.style.display = "block";

    renderCart();

    if (modal) modal.style.display = "flex";
}

// =========================
// ОТОБРАЖЕНИЕ КОРЗИНЫ
// =========================

function renderCart() {
    if (!cartContent) return;

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <h2>Корзина</h2>
            <p style="text-align: center; margin-top: 20px; color: #777;">Корзина пуста</p>
        `;
        return;
    }

    let html = `<h2>Корзина</h2>`;
    let productsTotal = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        productsTotal += itemTotal;
        totalItems += item.quantity;

        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name} ${item.grams ? `(${item.grams})` : ''}</strong>
                    <span>${formatPrice(item.price)} ₸ × ${item.quantity}</span>
                </div>

                <div class="cart-controls">
                    <button onclick="changeQuantity(${index}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>

                <div class="cart-item-total">
                    ${formatPrice(itemTotal)} ₸
                </div>
            </div>
        `;
    });

    const service = Math.round(productsTotal * 0.10);
    const grandTotal = productsTotal + service;

    html += `
        <div class="cart-summary">
            <div>
                <span>Товаров:</span>
                <strong>${totalItems}</strong>
            </div>
            <div>
                <span>Сумма:</span>
                <strong>${formatPrice(productsTotal)} ₸</strong>
            </div>
            <div>
                <span>Обслуживание 10%:</span>
                <strong>${formatPrice(service)} ₸</strong>
            </div>
            <div class="cart-grand-total">
                <span>Итого:</span>
                <strong>${formatPrice(grandTotal)} ₸</strong>
            </div>
        </div>
    `;

    cartContent.innerHTML = html;
}

// =========================
// ИЗМЕНЕНИЕ КОЛИЧЕСТВА В КОРЗИНЕ
// =========================

function changeQuantity(index, amount) {
    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
    renderCart();
    syncBarCounters();
}

// =========================
// ЛОГИКА ДЛЯ БАРНОГО МЕНЮ (+1-)
// =========================

function updateBarCart(button, change) {
    const itemContainer = button.closest('.bar-item');
    if (!itemContainer) return;

    const name = itemContainer.dataset.name || itemContainer.querySelector('.bar-item-title')?.textContent.trim();
    const volume = itemContainer.dataset.volume || itemContainer.querySelector('.volume')?.textContent.trim();
    const rawPrice = itemContainer.dataset.price || itemContainer.querySelector('.price')?.textContent.trim();
    const parsedPrice = parsePrice(rawPrice);

    let existingProduct = cart.find(
        item => item.name === name && item.grams === volume
    );

    if (existingProduct) {
        existingProduct.quantity += change;
        if (existingProduct.quantity <= 0) {
            cart = cart.filter(item => !(item.name === name && item.grams === volume));
        }
    } else if (change > 0) {
        cart.push({
            name: name,
            grams: volume,
            price: parsedPrice,
            quantity: 1
        });
    }

    updateCart();
    syncBarCounters();
}

// Синхронизация внешнего вида кнопок барного меню с содержимым массива cart
function syncBarCounters() {
    document.querySelectorAll('.bar-item').forEach(itemContainer => {
        const name = itemContainer.dataset.name || itemContainer.querySelector('.bar-item-title')?.textContent.trim();
        const volume = itemContainer.dataset.volume || itemContainer.querySelector('.volume')?.textContent.trim();

        const product = cart.find(item => item.name === name && item.grams === volume);
        const count = product ? product.quantity : 0;

        const controls = itemContainer.querySelector('.bar-controls');
        const countSpan = itemContainer.querySelector('.bar-count');

        if (countSpan) countSpan.textContent = count;

        if (controls) {
            if (count > 0) {
                controls.style.background = '#f2a900';
                controls.querySelectorAll('button').forEach(btn => btn.style.color = '#171717');
                if (countSpan) countSpan.style.color = '#ffffff';
            } else {
                controls.style.background = '#f5f5f5';
                if (countSpan) countSpan.style.color = '#171717';
            }
        }
    });
}

// =========================
// ЗАКРЫТИЕ МОДАЛКИ
// =========================

const closeBtn = document.querySelector(".close");
if (closeBtn) {
    closeBtn.onclick = function () {
        if (modal) modal.style.display = "none";
        if (cartButton) cartButton.style.display = "block";
    };
}

window.onclick = function (e) {
    if (e.target === modal) {
        modal.style.display = "none";
        if (cartButton) cartButton.style.display = "block";
    }
};

// =========================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =========================

function parsePrice(price) {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    return Number(
        String(price)
            .replace(/\s/g, "")
            .replace("₸", "")
            .replace(",", ".")
    ) || 0;
}

function formatPrice(price) {
    return Math.round(price)
        .toLocaleString("ru-RU")
        .replace(/\u00A0/g, " ");
}