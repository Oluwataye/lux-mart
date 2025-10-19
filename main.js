// QuickMart POS System - Main JavaScript with Authentication
class QuickMartPOS {
    constructor() {
        this.cart = [];
        this.products = [];
        this.currentTransactionId = this.generateTransactionId();
        this.currentCategory = 'all';
        this.isProcessingPayment = false;
        this.discount = { type: null, value: 0, reason: '' };
        this.calculator = { display: '0', currentInput: '', operator: '' };
        this.currentUser = null;
        
        this.initializeData();
        this.initializeEventListeners();
        this.updateClock();
        this.checkAuthentication();
        this.loadProducts();
    }

    generateTransactionId() {
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `TXN-${timestamp}-${randomNum}`;
    }

    initializeData() {
        // Initialize sample products with real images
        this.products = [
            // Beverages
            { id: 'b1', name: 'Coca-Cola', category: 'beverages', price: 2.49, cost: 1.20, stock: 150, barcode: '123456789012', image: 'https://kimi-web-img.moonshot.cn/img/cdn1.woolworths.media/869ec344c80245a26773b0946050a2152fcd347c.jpg', description: 'Classic Coca-Cola 330ml' },
            { id: 'b2', name: 'Pepsi', category: 'beverages', price: 2.39, cost: 1.15, stock: 120, barcode: '123456789013', image: 'https://kimi-web-img.moonshot.cn/img/cdn1.woolworths.media/869ec344c80245a26773b0946050a2152fcd347c.jpg', description: 'Pepsi Cola 330ml' },
            { id: 'b3', name: 'Red Bull', category: 'beverages', price: 3.99, cost: 2.00, stock: 80, barcode: '123456789014', image: 'https://kimi-web-img.moonshot.cn/img/d3koznjjgilbyx.cloudfront.net/4e9cd7ac9d5d02fb6b206d681e8fbd45a0c3522b.jpg', description: 'Red Bull Energy Drink 250ml' },
            { id: 'b4', name: 'Monster Energy', category: 'beverages', price: 3.79, cost: 1.90, stock: 90, barcode: '123456789015', image: 'https://kimi-web-img.moonshot.cn/img/www.priceplow.com/dd02fade82508fbb9a9e7cb61d6ecfcc9ce44e07.jpg', description: 'Monster Energy Drink 500ml' },
            { id: 'b5', name: 'Gatorade', category: 'beverages', price: 2.99, cost: 1.50, stock: 100, barcode: '123456789016', image: 'https://kimi-web-img.moonshot.cn/img/cdn1.woolworths.media/869ec344c80245a26773b0946050a2152fcd347c.jpg', description: 'Gatorade Sports Drink 500ml' },
            
            // Snacks
            { id: 's1', name: 'Lay\'s Classic', category: 'snacks', price: 1.99, cost: 0.95, stock: 200, barcode: '123456789017', image: 'https://kimi-web-img.moonshot.cn/img/cdn0.woolworths.media/15e603db79bbb8826177e5d428431f8acbb4904f.jpg', description: 'Lay\'s Classic Potato Chips' },
            { id: 's2', name: 'Doritos Nacho', category: 'snacks', price: 2.29, cost: 1.10, stock: 180, barcode: '123456789018', image: 'https://kimi-web-img.moonshot.cn/img/cdn0.woolworths.media/15e603db79bbb8826177e5d428431f8acbb4904f.jpg', description: 'Doritos Nacho Cheese' },
            { id: 's3', name: 'Pringles Original', category: 'snacks', price: 2.49, cost: 1.25, stock: 150, barcode: '123456789019', image: 'https://kimi-web-img.moonshot.cn/img/cdn0.woolworths.media/15e603db79bbb8826177e5d428431f8acbb4904f.jpg', description: 'Pringles Original Potato Crisps' },
            
            // Candy
            { id: 'c1', name: 'Snickers', category: 'candy', price: 1.49, cost: 0.75, stock: 300, barcode: '123456789020', image: 'https://kimi-web-img.moonshot.cn/img/cdn11.bigcommerce.com/dbb1fb197d2bef4343ffc27c5b6c361492627a16.jpg', description: 'Snickers Chocolate Bar' },
            { id: 'c2', name: 'Mars Bar', category: 'candy', price: 1.49, cost: 0.75, stock: 280, barcode: '123456789021', image: 'https://kimi-web-img.moonshot.cn/img/vignette.wikia.nocookie.net/d3e582922996093f9a675db7774148a8b6983fbf', description: 'Mars Chocolate Bar' },
            { id: 'c3', name: 'KitKat', category: 'candy', price: 1.39, cost: 0.70, stock: 320, barcode: '123456789022', image: 'https://kimi-web-img.moonshot.cn/img/images.says.com/206e7ef075065ebfce96f69b81e0a05071b650a0.png', description: 'KitKat Chocolate Bar' },
            { id: 'c4', name: 'Twix', category: 'candy', price: 1.49, cost: 0.75, stock: 250, barcode: '123456789023', image: 'https://kimi-web-img.moonshot.cn/img/cdn11.bigcommerce.com/dbb1fb197d2bef4343ffc27c5b6c361492627a16.jpg', description: 'Twix Chocolate Bar' },
            { id: 'c5', name: 'Reese\'s Cups', category: 'candy', price: 1.59, cost: 0.80, stock: 200, barcode: '123456789024', image: 'https://kimi-web-img.moonshot.cn/img/cdn11.bigcommerce.com/dbb1fb197d2bef4343ffc27c5b6c361492627a16.jpg', description: 'Reese\'s Peanut Butter Cups' },
            
            // Tobacco
            { id: 't1', name: 'Marlboro Red', category: 'tobacco', price: 8.99, cost: 5.50, stock: 50, barcode: '123456789025', image: 'https://kimi-web-img.moonshot.cn/img/i.ebayimg.com/291e36f69776cda6dff2d5c7c9dd3b26be2c14ab.jpg', description: 'Marlboro Red Cigarettes' },
            
            // Health
            { id: 'h1', name: 'Tylenol', category: 'health', price: 4.99, cost: 2.50, stock: 75, barcode: '123456789026', image: 'https://kimi-web-img.moonshot.cn/img/cdn1.woolworths.media/869ec344c80245a26773b0946050a2152fcd347c.jpg', description: 'Tylenol Pain Relief' },
            
            // Automotive
            { id: 'a1', name: 'Motor Oil', category: 'automotive', price: 12.99, cost: 8.00, stock: 30, barcode: '123456789027', image: 'https://kimi-web-img.moonshot.cn/img/cdn1.woolworths.media/869ec344c80245a26773b0946050a2152fcd347c.jpg', description: '5W-30 Motor Oil 1L' }
        ];

        // Save to localStorage for persistence
        localStorage.setItem('pos_products', JSON.stringify(this.products));
        
        // Initialize transactions array if not exists
        if (!localStorage.getItem('pos_transactions')) {
            localStorage.setItem('pos_transactions', JSON.stringify([]));
        }
    }

    checkAuthentication() {
        // Check if user is authenticated
        const session = localStorage.getItem('pos_session');
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const sessionData = JSON.parse(session);
            this.currentUser = sessionData.user;
            
            // Check if user has permission to access POS
            if (!this.hasPermission('pos_access')) {
                this.showNotification('You do not have permission to access the POS terminal', 'error');
                setTimeout(() => {
                    auth.logout();
                }, 2000);
                return;
            }

            // Update UI with current user info
            this.updateUserInfo();
            
        } catch (error) {
            window.location.href = 'login.html';
        }
    }

    updateUserInfo() {
        // Update cashier name in header
        const cashierElement = document.querySelector('#current-time').previousElementSibling;
        if (cashierElement && this.currentUser) {
            cashierElement.innerHTML = `<div class="font-medium">Cashier: ${this.currentUser.name}</div>`;
        }
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        if (this.currentUser.role === 'super_admin') return true;
        return this.currentUser.permissions && this.currentUser.permissions.includes(permission);
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    initializeEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveCategory(e.target.dataset.category);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('product-search');
        searchInput.addEventListener('input', (e) => {
            this.searchProducts(e.target.value);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.clearCart();
            } else if (e.key === 'F2') {
                e.preventDefault();
                document.getElementById('product-search').focus();
            } else if (e.key === 'F3') {
                e.preventDefault();
                this.processPayment('cash');
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.clearCart();
            } else if (e.key === 'F4') {
                e.preventDefault();
                this.showBarcodeScanner();
            } else if (e.key === 'F5') {
                e.preventDefault();
                this.showDiscountModal();
            } else if (e.key === 'F6') {
                e.preventDefault();
                this.showCalculator();
            }
        });
    }

    updateClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const timeElement = document.getElementById('current-time');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    setActiveCategory(category) {
        this.currentCategory = category;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-orange-500', 'text-white');
            btn.classList.add('hover:bg-gray-100');
        });
        
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-orange-500', 'text-white');
            activeBtn.classList.remove('hover:bg-gray-100');
        }
        
        this.loadProducts();
    }

    searchProducts(query) {
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.barcode.includes(query)
        );
        
        this.renderProducts(filteredProducts);
    }

    loadProducts() {
        let productsToShow = this.products;
        
        if (this.currentCategory !== 'all') {
            productsToShow = this.products.filter(product => 
                product.category === this.currentCategory
            );
        }
        
        this.renderProducts(productsToShow);
    }

    renderProducts(products) {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            grid.appendChild(productCard);
        });
        
        // Animate product cards
        anime({
            targets: '.product-card',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(50),
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-lg shadow-md p-4 hover-lift relative';
        card.onclick = () => this.addToCart(product);
        
        const stockStatus = product.stock > 0 ? 
            `<span class="text-green-600 text-xs">✓ In Stock</span>` :
            `<span class="text-red-600 text-xs">✗ Out of Stock</span>`;
        
        const discountBadge = this.discount.value > 0 ? 
            `<div class="discount-badge">${this.discount.type === 'percentage' ? this.discount.value + '%' : '$' + this.discount.value}</div>` : '';
        
        card.innerHTML = `
            ${discountBadge}
            <div class="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                <img src="${product.image}" alt="${product.name}" 
                     class="w-full h-full object-cover" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA5NS4wMzU3IDc3LjE2NDMgOTUuMDM1NyA4NS40NDg3VjExNC41NTFDOTUuMDM1NyAxMjIuODM2IDEwOC4yODQgMTMwIDEwMCAxMzBDOTEuNzE1NyAxMzAgODQuNTUxMyAxMjIuODM2IDg0LjU1MTMgMTE0LjU1MVY4NS40NDg3Qzg0LjU1MTMgNzcuMTY0MyA5MS43MTU3IDcwIDEwMCA3MFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+'">
            </div>
            <h4 class="font-medium text-gray-800 mb-1 truncate">${product.name}</h4>
            <p class="text-sm text-gray-600 mb-2 truncate">${product.description}</p>
            <div class="flex justify-between items-center mb-2">
                <span class="text-lg font-bold text-orange-600 mono">$${product.price.toFixed(2)}</span>
                ${stockStatus}
            </div>
            <div class="text-xs text-gray-500">
                Stock: ${product.stock} | Code: ${product.barcode.slice(-4)}
            </div>
        `;
        
        return card;
    }

    addToCart(product) {
        if (!this.hasPermission('pos_access')) {
            this.showNotification('You do not have permission to add items to cart', 'error');
            return;
        }

        if (product.stock <= 0) {
            this.showNotification('Product out of stock!', 'error');
            return;
        }
        
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
                existingItem.total = existingItem.quantity * existingItem.price;
            } else {
                this.showNotification('Not enough stock available!', 'warning');
                return;
            }
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                total: product.price,
                image: product.image
            });
        }
        
        this.updateCartDisplay();
        this.showNotification(`Added ${product.name} to cart!`, 'success');
        
        // Animate cart update
        anime({
            targets: '#cart-items',
            scale: [0.98, 1],
            duration: 200,
            easing: 'easeOutQuad'
        });
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const subtotalEl = document.getElementById('cart-subtotal');
        const taxEl = document.getElementById('cart-tax');
        const totalEl = document.getElementById('cart-total');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-4"></path>
                    </svg>
                    <p>No items in cart</p>
                    <p class="text-sm">Add products to start sale</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-2 relative">
                    <div class="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CiRwYXRoIGQ9Ik0yNCAxNUMyMi43NjE0IDE1IDI1IDE3LjIzODYgMjUgMjBDMjUgMjIuNzYxNCAyMi43NjE0IDI1IDIwIDI1QzE3LjIzODYgMjUgMTUgMjIuNzYxNCAxNSAyMEMxNSAxNy4yMzg2IDE3LjIzODYgMTUgMjAgMTVaIiBmaWxsPSIjOUNBNEFGIi8+CiPC9zdmc+'">
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-sm">${item.name}</div>
                        <div class="text-xs text-gray-600 mono">$${item.price.toFixed(2)} × ${item.quantity}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold mono">$${item.total.toFixed(2)}</div>
                        <div class="flex items-center space-x-1 mt-1">
                            <button class="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300" onclick="pos.decreaseQuantity('${item.id}')">-</button>
                            <button class="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300" onclick="pos.increaseQuantity('${item.id}')">+</button>
                            <button class="w-6 h-6 bg-red-200 rounded text-xs hover:bg-red-300" onclick="pos.removeFromCart('${item.id}')">×</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Calculate totals with discount
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        let discountAmount = 0;
        
        if (this.discount.value > 0) {
            if (this.discount.type === 'percentage') {
                discountAmount = subtotal * (this.discount.value / 100);
            } else {
                discountAmount = this.discount.value;
            }
        }
        
        const taxableAmount = subtotal - discountAmount;
        const tax = taxableAmount * 0.08; // 8% tax
        const total = taxableAmount + tax;
        
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        taxEl.textContent = `$${tax.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
        
        // Show discount if applied
        if (discountAmount > 0) {
            const discountRow = document.createElement('div');
            discountRow.className = 'flex justify-between text-sm text-green-600';
            discountRow.innerHTML = `
                <span>Discount (${this.discount.type === 'percentage' ? this.discount.value + '%' : '$' + this.discount.value}):</span>
                <span class="mono">-$${discountAmount.toFixed(2)}</span>
            `;
            
            // Insert discount row before tax
            const taxRow = taxEl.parentElement;
            taxRow.parentElement.insertBefore(discountRow, taxRow);
        }
    }

    increaseQuantity(productId) {
        const item = this.cart.find(item => item.id === productId);
        const product = this.products.find(p => p.id === productId);
        
        if (item && product && item.quantity < product.stock) {
            item.quantity += 1;
            item.total = item.quantity * item.price;
            this.updateCartDisplay();
        } else {
            this.showNotification('Not enough stock available!', 'warning');
        }
    }

    decreaseQuantity(productId) {
        const item = this.cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.total = item.quantity * item.price;
                this.updateCartDisplay();
            }
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
    }

    clearCart() {
        if (this.cart.length === 0) return;
        
        this.cart = [];
        this.discount = { type: null, value: 0, reason: '' };
        this.updateCartDisplay();
        this.showNotification('Cart cleared!', 'info');
        
        // Generate new transaction ID
        this.currentTransactionId = this.generateTransactionId();
        document.getElementById('transaction-id').textContent = this.currentTransactionId;
    }

    // Quick Actions Methods
    showBarcodeScanner() {
        if (!this.hasPermission('pos_access')) {
            this.showNotification('You do not have permission to use the barcode scanner', 'error');
            return;
        }

        document.getElementById('barcode-modal').classList.remove('hidden');
        document.getElementById('manual-barcode').focus();
        this.showNotification('Barcode scanner activated', 'info');
    }

    closeBarcodeScanner() {
        document.getElementById('barcode-modal').classList.add('hidden');
        document.getElementById('manual-barcode').value = '';
    }

    processBarcode() {
        const barcode = document.getElementById('manual-barcode').value.trim();
        if (!barcode) {
            this.showNotification('Please enter a barcode', 'error');
            return;
        }
        
        const product = this.products.find(p => p.barcode === barcode);
        if (product) {
            this.addToCart(product);
            this.closeBarcodeScanner();
            this.showNotification(`Product found: ${product.name}`, 'success');
        } else {
            this.showNotification('Product not found for barcode: ' + barcode, 'error');
        }
    }

    showDiscountModal() {
        if (!this.hasPermission('pos_access')) {
            this.showNotification('You do not have permission to apply discounts', 'error');
            return;
        }

        if (this.cart.length === 0) {
            this.showNotification('Add items to cart before applying discount', 'warning');
            return;
        }
        
        document.getElementById('discount-modal').classList.remove('hidden');
        document.getElementById('discount-value').focus();
    }

    closeDiscountModal() {
        document.getElementById('discount-modal').classList.add('hidden');
        document.getElementById('discount-type').value = 'percentage';
        document.getElementById('discount-value').value = '';
        document.getElementById('discount-reason').value = '';
    }

    applyDiscount() {
        const type = document.getElementById('discount-type').value;
        const value = parseFloat(document.getElementById('discount-value').value);
        const reason = document.getElementById('discount-reason').value;
        
        if (!value || value <= 0) {
            this.showNotification('Please enter a valid discount value', 'error');
            return;
        }
        
        if (type === 'percentage' && value > 100) {
            this.showNotification('Percentage discount cannot exceed 100%', 'error');
            return;
        }
        
        this.discount = { type, value, reason };
        this.updateCartDisplay();
        this.closeDiscountModal();
        
        const discountText = type === 'percentage' ? `${value}%` : `$${value}`;
        this.showNotification(`Discount of ${discountText} applied successfully`, 'success');
        
        // Log discount application
        this.logEvent('discount_applied', `Discount applied: ${discountText}${reason ? ' - ' + reason : ''}`);
    }

    generateQuickReport() {
        if (!this.hasPermission('view_analytics')) {
            this.showNotification('You do not have permission to generate reports', 'error');
            return;
        }

        const transactions = JSON.parse(localStorage.getItem('pos_transactions') || '[]');
        const today = new Date();
        const todayTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.timestamp);
            return transactionDate.toDateString() === today.toDateString();
        });
        
        const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.totals.total, 0);
        const totalTransactions = todayTransactions.length;
        const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        
        const reportContent = `
            <div class="bg-white p-6 rounded-lg shadow-lg max-w-md">
                <h3 class="text-lg font-semibold mb-4">Quick Daily Report</h3>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span>Total Sales:</span>
                        <span class="font-bold mono">$${totalRevenue.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Transactions:</span>
                        <span class="font-bold">${totalTransactions}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Avg Transaction:</span>
                        <span class="font-bold mono">$${avgTransaction.toFixed(2)}</span>
                    </div>
                </div>
                <div class="mt-4 text-sm text-gray-600">
                    Report generated at: ${today.toLocaleTimeString()}
                </div>
            </div>
        `;
        
        // Create and show report modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = reportContent;
        document.body.appendChild(modal);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 5000);
        
        this.showNotification('Quick report generated', 'success');
    }

    openCashDrawer() {
        if (!this.hasPermission('pos_access')) {
            this.showNotification('You do not have permission to open the cash drawer', 'error');
            return;
        }

        this.showNotification('Cash drawer opened', 'success');
        
        // Play cash drawer sound (if available)
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.play().catch(() => {}); // Ignore audio play errors

        // Log cash drawer opening
        this.logEvent('cash_drawer_opened', 'Cash drawer opened by cashier');
    }

    showCalculator() {
        if (!this.hasPermission('pos_access')) {
            this.showNotification('You do not have permission to use the calculator', 'error');
            return;
        }

        document.getElementById('calculator-modal').classList.remove('hidden');
        document.getElementById('calculator-display').value = '0';
        this.calculator = { display: '0', currentInput: '', operator: '' };
    }

    closeCalculator() {
        document.getElementById('calculator-modal').classList.add('hidden');
    }

    calculatorInput(value) {
        if (this.calculator.display === '0' || this.calculator.display === 'Error') {
            this.calculator.display = value;
        } else {
            this.calculator.display += value;
        }
        document.getElementById('calculator-display').value = this.calculator.display;
    }

    calculatorClear() {
        this.calculator = { display: '0', currentInput: '', operator: '' };
        document.getElementById('calculator-display').value = '0';
    }

    calculatorEquals() {
        try {
            const result = eval(this.calculator.display);
            this.calculator.display = result.toString();
            document.getElementById('calculator-display').value = this.calculator.display;
        } catch (error) {
            this.calculator.display = 'Error';
            document.getElementById('calculator-display').value = 'Error';
        }
    }

    logEvent(eventType, description) {
        const logs = JSON.parse(localStorage.getItem('pos_audit_logs') || '[]');
        logs.push({
            timestamp: new Date().toISOString(),
            eventType: eventType,
            description: description,
            userId: this.currentUser?.id,
            username: this.currentUser?.username
        });
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('pos_audit_logs', JSON.stringify(logs));
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const icon = document.getElementById('notification-icon');
        const title = document.getElementById('notification-title');
        const messageEl = document.getElementById('notification-message');
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        
        icon.textContent = icons[type] || icons.info;
        title.textContent = titles[type] || titles.info;
        messageEl.textContent = message;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize POS system
const pos = new QuickMartPOS();

// Global functions for HTML onclick handlers
function clearCart() {
    pos.clearCart();
}

function processPayment(method) {
    pos.processPayment(method);
}

function printReceipt() {
    pos.printReceipt();
}

function showNotification(message, type) {
    pos.showNotification(message, type);
}

function closeReceiptModal() {
    document.getElementById('receipt-modal').classList.add('hidden');
}

function printReceiptContent() {
    window.print();
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add authentication check for all pages except login
    if (!window.location.pathname.includes('login.html')) {
        const session = localStorage.getItem('pos_session');
        if (!session) {
            window.location.href = 'login.html';
        }
    }
});
