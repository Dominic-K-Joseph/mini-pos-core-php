let cart = {};

//FORMAT CURRENCY
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

//LOAD PRODUCTS (API)
function loadProducts() {
    axios.get('api/get_products.php')
        .then(res => {
            let html = '';

            res.data.forEach(p => {
                html += `
                    <div class="product-card">
                        <h4>${p.name}</h4>
                        <p>${formatCurrency(p.price)}</p>
                        <p>Stock: <span id="stock-${p.id}">${p.stock}</span></p>

                         <button class="add-btn ${p.stock == 0 ? 'out-stock' : ''}"
                            onclick="addToCart(${p.id}, '${p.name}', ${p.price})"
                            ${p.stock == 0 ? 'disabled' : ''}>
                            ${p.stock == 0 ? 'Out of Stock' : 'Add'}
                        </button>
                    </div>
                `;
            });

            document.getElementById('products-list').innerHTML = html;
        });
}

// ADD TO CART
function addToCart(id, name, price) {
    if (!cart[id]) {
        cart[id] = { id, name, price, qty: 1 };
    } else {
        cart[id].qty++;
    }
    renderCart();
}

//INCREASE
function increase(id) {
    cart[id].qty++;
    renderCart();
}

// DECREASE
function decrease(id) {
    cart[id].qty--;

    if (cart[id].qty <= 0) {
        delete cart[id];
    }

    renderCart();
}

//REMOVE
function removeItem(id) {
    delete cart[id];
    renderCart();
}

//RENDER CART (NEW UI)
function renderCart() {
    let html = '';
    let total = 0;

    Object.values(cart).forEach(item => {
        let itemTotal = item.qty * item.price;
        total += itemTotal;

        html += `
            <div class="cart-row">
                
                <div class="cart-left">
                    <strong>${item.name}</strong><br>
                    ${formatCurrency(item.price)} x ${item.qty}
                </div>

                <div class="cart-right">
                    <div class="btn-group">
                        <button class="btn minus" onclick="decrease(${item.id})">-</button>
                        <button class="btn plus" onclick="increase(${item.id})">+</button>
                        <button class="btn remove" onclick="removeItem(${item.id})">x</button>
                    </div>

                    <div class="item-total">
                        ${formatCurrency(itemTotal)}
                    </div>
                </div>

            </div>
            <hr class="divider">
        `;
    });

    document.getElementById('cart-items').innerHTML = html;
    document.getElementById('total').innerText = formatCurrency(total);
}

//PLACE ORDER (API)
function placeOrder() {
    let items = Object.values(cart);

    if (items.length === 0) {
        alert("Cart is empty");
        return;
    }

    let total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    axios.post('api/place_order.php', {
        items: items,
        total: total
    })
    .then(res => {
        if (res.data.status === 'success') {
            alert('Order placed successfully');
            cart = {};
            renderCart();
            loadProducts(); // refresh stock
        } else {
            alert(res.data.message);
        }
    })
    .catch(err => {
        alert("Error placing order");
    });
}

// AUTO STOCK REFRESH (every 3 sec)
setInterval(() => {
    axios.get('api/get_products.php')
        .then(res => {
            res.data.forEach(product => {
                let el = document.getElementById(`stock-${product.id}`);
                if (el) el.innerText = product.stock;
            });
        });
}, 3000);

//INIT
loadProducts();