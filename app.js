// Variables globales
let currentUserId = 1; // ID del usuario logueado
let cartId = null; // Almacena el ID del carrito del usuario

// Función para mostrar u ocultar secciones
function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none'; // Ocultamos todas las secciones
    });
    document.getElementById(sectionId).style.display = 'block'; // Mostramos la sección requerida
}

// Login
document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Llamada al API de login
    const response = await fetch('https://fakestoreapi.com/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    const data = await response.json();

    if (data.token) {
        showSection('welcome-section'); // Mostrar la sección de bienvenida
        document.getElementById('user-name').textContent = 'Jhon Doe'; // Nombre del usuario
        localStorage.setItem('token', data.token);
    } else {
        document.getElementById('login-message').textContent = 'Login fallido';
    }
});

// Ver Productos
document.getElementById('view-products').addEventListener('click', () => {
    showSection('products-section'); // Mostrar la sección de productos
});

// Cargar productos según la categoría
document.getElementById('load-products').addEventListener('click', async () => {
    const category = document.getElementById('category-select').value;
    const url = category ? `https://fakestoreapi.com/products/category/${category}` : 'https://fakestoreapi.com/products';

    const response = await fetch(url);
    const products = await response.json();

    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '';

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <p>Precio: $${product.price}</p>
            <img src="${product.image}" alt="${product.title}" style="width:100px; height:100px;">
            <button class="add-to-cart" data-product-id="${product.id}">Add</button>
        `;
        productsList.appendChild(productDiv);
    });

    // Añadir event listeners para los botones "Add"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
});

// Función para agregar productos al carrito
async function addToCart(event) {
    const productId = event.target.getAttribute('data-product-id');

    if (!cartId) {
        // Si el carrito aún no existe, creamos uno
        const response = await fetch('https://fakestoreapi.com/carts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUserId,
                date: new Date(),
                products: [{ productId: parseInt(productId), quantity: 1 }]
            })
        });

        const data = await response.json();
        cartId = data.id; // Guardamos el ID del carrito
        alert('Producto agregado al carrito');
    } else {
        // Si el carrito ya existe, actualizamos los productos
        const response = await fetch(`https://fakestoreapi.com/carts/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUserId,
                date: new Date(),
                products: [{ productId: parseInt(productId), quantity: 1 }]
            })
        });

        const data = await response.json();
        alert('Producto actualizado en el carrito');
    }
}

// Ver el carrito del usuario
document.getElementById('view-cart').addEventListener('click', async () => {
    showSection('cart-section'); // Mostrar la sección del carrito

    const response = await fetch(`https://fakestoreapi.com/carts/user/${currentUserId}`);
    const carts = await response.json();

    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = '';

    carts.forEach(cart => {
        const cartDiv = document.createElement('div');
        cartDiv.classList.add('cart-item');
        cartDiv.innerHTML = `
            <h3>Carrito ID: ${cart.id}</h3>
            <p>Fecha: ${new Date(cart.date).toLocaleDateString()}</p>
            <p>Productos: ${cart.products.length}</p>
            <button class="view-cart" data-cart-id="${cart.id}">Ver</button>
        `;
        cartList.appendChild(cartDiv);
    });

    // Añadir event listeners para los botones "Ver"
    document.querySelectorAll('.view-cart').forEach(button => {
        button.addEventListener('click', viewOrderDetails);
    });
});

// Cargar los detalles del carrito seleccionado
async function viewOrderDetails(event) {
    const cartId = event.target.getAttribute('data-cart-id');
    const response = await fetch(`https://fakestoreapi.com/carts/${cartId}`);
    const cart = await response.json();

    showSection('order-details-section'); // Mostrar la sección de detalles del pedido

    const orderDetails = document.getElementById('order-details');
    const orderTotalElement = document.getElementById('order-total');
    let total = 0;

    orderDetails.innerHTML = '';

    // Usamos Promise.all para esperar que todas las solicitudes de productos se completen
    const productPromises = cart.products.map(async (product) => {
        const productResponse = await fetch(`https://fakestoreapi.com/products/${product.productId}`);
        const productData = await productResponse.json();
        
        const productTotal = productData.price * product.quantity;
        total += productTotal;

        const productDiv = document.createElement('div');
        productDiv.classList.add('order-product');
        productDiv.innerHTML = `
            <h3>${productData.title}</h3>
            <p>Cantidad: ${product.quantity}</p>
            <p>Precio unitario: $${productData.price}</p>
            <p>Total del producto: $${productTotal.toFixed(2)}</p>
        `;
        orderDetails.appendChild(productDiv);
    });

    await Promise.all(productPromises);

    orderTotalElement.textContent = total.toFixed(2);
}

// Botones de "Seguir Comprando" y "Salir"
document.getElementById('continue-shopping').addEventListener('click', () => {
    showSection('products-section'); // Redirige a la sección de productos
});

document.getElementById('continue-shopping-order').addEventListener('click', () => {
    showSection('products-section'); // Redirige a la sección de productos
});

// Botón de salir para cerrar sesión
function logout() {
    localStorage.removeItem('token');
    showSection('login-section'); // Redirige a la sección de login
}

document.getElementById('logout-button').addEventListener('click', logout);
document.getElementById('logout-button-cart').addEventListener('click', logout);
document.getElementById('logout-button-order').addEventListener('click', logout);

// Botón para ir al carrito desde la sección de productos
document.getElementById('go-to-cart').addEventListener('click', () => {
    showSection('cart-section'); // Redirige a la sección del carrito
});
