// Inventory Management System
class InventoryManager {
    constructor() {
        this.products = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.updateClock();
        this.updateStats();
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

    loadProducts() {
        const stored = localStorage.getItem('pos_products');
        if (stored) {
            this.products = JSON.parse(stored);
        } else {
            // Initialize with sample data if none exists
            this.products = [
                { id: 'b1', name: 'Coca-Cola', category: 'beverages', price: 2.49, cost: 1.20, stock: 150, barcode: '123456789012', image: 'https://kimi-web-img.moonshot.cn/img/cdn1.woolworths.media/869ec344c80245a26773b0946050a2152fcd347c.jpg', description: 'Classic Coca-Cola 330ml' },
                { id: 'b2', name: 'Pepsi', category: 'beverages', price: 2.39, cost: 1.15, stock: 120, barcode: '123456789013', image: 'https://kimi-web-img.moonshot.cn/img/cdn1.woolworths.media/869ec344c80245a26773b0946050a2152fcd347c.jpg', description: 'Pepsi Cola 330ml' },
                { id: 'b3', name: 'Red Bull', category: 'beverages', price: 3.99, cost: 2.00, stock: 80, barcode: '123456789014', image: 'https://kimi-web-img.moonshot.cn/img/d3koznjjgilbyx.cloudfront.net/4e9cd7ac9d5d02fb6b206d681e8fbd45a0c3522b.jpg', description: 'Red Bull Energy Drink 250ml' },
                { id: 'b4', name: 'Monster Energy', category: 'beverages', price: 3.79, cost: 1.90, stock: 90, barcode: '123456789015', image: 'https://kimi-web-img.moonshot.cn/img/www.priceplow.com/dd02fade82508fbb9a9e7cb61d6ecfcc9ce44e07.jpg', description: 'Monster Energy Drink 500ml' },
                { id: 'b5', name: 'Gatorade', category: 'beverages', price: 2.99, cost: 1.50, stock: 100, barcode: '123456789016', image: 'https://kimi-web-img.moonshot.cn/img/cdn1.woolworths.media/869ec344c80245a26773b0946050a2152fcd347c.jpg', description: 'Gatorade Sports Drink 500ml' },
                { id: 's1', name: 'Lay\'s Classic', category: 'snacks', price: 1.99, cost: 0.95, stock: 200, barcode: '123456789017', image: 'https://kimi-web-img.moonshot.cn/img/cdn0.woolworths.media/15e603db79bbb8826177e5d428431f8acbb4904f.jpg', description: 'Lay\'s Classic Potato Chips' },
                { id: 's2', name: 'Doritos Nacho', category: 'snacks', price: 2.29, cost: 1.10, stock: 180, barcode: '123456789018', image: 'https://kimi-web-img.moonshot.cn/img/cdn0.woolworths.media/15e603db79bbb8826177e5d428431f8acbb4904f.jpg', description: 'Doritos Nacho Cheese' },
                { id: 's3', name: 'Pringles Original', category: 'snacks', price: 2.49, cost: 1.25, stock: 150, barcode: '123456789019', image: 'https://kimi-web-img.moonshot.cn/img/cdn0.woolworths.media/15e603db79bbb8826177e5d428431f8acbb4904f.jpg', description: 'Pringles Original Potato Crisps' },
                { id: 'c1', name: 'Snickers', category: 'candy', price: 1.49, cost: 0.75, stock: 300, barcode: '123456789020', image: 'https://kimi-web-img.moonshot.cn/img/cdn11.bigcommerce.com/dbb1fb197d2bef4343ffc27c5b6c361492627a16.jpg', description: 'Snickers Chocolate Bar' },
                { id: 'c2', name: 'Mars Bar', category: 'candy', price: 1.49, cost: 0.75, stock: 280, barcode: '123456789021', image: 'https://kimi-web-img.moonshot.cn/img/vignette.wikia.nocookie.net/d3e582922996093f9a675db7774148a8b6983fbf', description: 'Mars Chocolate Bar' },
                { id: 'c3', name: 'KitKat', category: 'candy', price: 1.39, cost: 0.70, stock: 320, barcode: '123456789022', image: 'https://kimi-web-img.moonshot.cn/img/images.says.com/206e7ef075065ebfce96f69b81e0a05071b650a0.png', description: 'KitKat Chocolate Bar' },
                { id: 't1', name: 'Marlboro Red', category: 'tobacco', price: 8.99, cost: 5.50, stock: 50, barcode: '123456789025', image: 'https://kimi-web-img.moonshot.cn/img/i.ebayimg.com/291e36f69776cda6dff2d5c7c9dd3b26be2c14ab.jpg', description: 'Marlboro Red Cigarettes' },
                { id: 'h1', name: 'Tylenol', category: 'health', price: 4.99, cost: 2.50, stock: 75, barcode: '123456789026', image: 'https://kimi-web-img.moonshot.cn/img/cdn1.woolworths.media/869ec344c80245a26773b0946050a2152fcd347c.jpg', description: 'Tylenol Pain Relief' },
                { id: 'a1', name: 'Motor Oil', category: 'automotive', price: 12.99, cost: 8.00, stock: 30, barcode: '123456789027', image: 'https://kimi-web-img.moonshot.cn/img/cdn1.woolworths.media/869ec344c80245a26773b0946050a2152fcd347c.jpg', description: '5W-30 Motor Oil 1L' }
            ];
            localStorage.setItem('pos_products', JSON.stringify(this.products));
        }
        
        this.renderProducts();
        this.updateStats();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }

        // Product form submission
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }
    }

    updateStats() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, product) => sum + (product.stock * product.cost), 0);
        const lowStockItems = this.products.filter(product => product.stock < 20).length;
        const categories = [...new Set(this.products.map(product => product.category))].length;

        // Update DOM elements with error handling
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };

        updateElement('total-products', totalProducts);
        updateElement('total-value', `$${totalValue.toFixed(2)}`);
        updateElement('low-stock-items', lowStockItems);
        updateElement('categories-count', categories);
    }

    renderProducts(productsToRender = null) {
        const products = productsToRender || this.products;
        const tableBody = document.getElementById('products-table-body');
        
        if (!tableBody) return;

        tableBody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            
            // Determine stock status
            let stockClass = 'stock-high';
            let stockStatus = '●';
            
            if (product.stock < 10) {
                stockClass = 'stock-low';
                stockStatus = '●';
            } else if (product.stock < 20) {
                stockClass = 'stock-medium';
                stockStatus = '●';
            }

            const profitMargin = ((product.price - product.cost) / product.price * 100).toFixed(1);
            const inventoryValue = (product.stock * product.cost).toFixed(2);

            row.className = `${stockClass} hover:bg-gray-50`;
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden mr-3">
                            <img src="${product.image || ''}" alt="${product.name}" class="w-full h-full object-cover"
                                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CiRwYXRoIGQ9Ik0yMCAxNUMyMi43NjE0IDE1IDI1IDE3LjIzODYgMjUgMjBDMjUgMjIuNzYxNCAyMi43NjE0IDI1IDIwIDI1QzE3LjIzODYgMjUgMTUgMjIuNzYxNCAxNSAyMEMxNSAxNy4yMzg2IDE3LjIzODYgMTUgMjAgMTVaIiBmaWxsPSIjOUNBNEFGIi8+CiPC9zdmc+'">
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${product.name}</div>
                            <div class="text-sm text-gray-500 truncate">${product.description || 'No description'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${this.formatCategoryName(product.category)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 mono">$${product.price.toFixed(2)}</div>
                    <div class="text-sm text-gray-500">Margin: ${profitMargin}%</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 mono">$${product.cost.toFixed(2)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <span class="text-lg mr-2 ${stockStatus === '●' ? (stockClass === 'stock-low' ? 'text-red-500' : stockClass === 'stock-medium' ? 'text-yellow-500' : 'text-green-500') : ''}">${stockStatus}</span>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${product.stock}</div>
                            <div class="text-sm text-gray-500 mono">$${inventoryValue}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 mono">
                    ${product.barcode}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="inventoryManager.editProduct('${product.id}')" 
                                class="text-blue-600 hover:text-blue-900 transition-colors">
                            ✏️
                        </button>
                        <button onclick="inventoryManager.adjustStock('${product.id}')" 
                                class="text-green-600 hover:text-green-900 transition-colors">
                            📦
                        </button>
                        <button onclick="inventoryManager.deleteProduct('${product.id}')" 
                                class="text-red-600 hover:text-red-900 transition-colors">
                            🗑️
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });

        // Animate rows
        anime({
            targets: '#products-table-body tr',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(30),
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    formatCategoryName(category) {
        const categoryNames = {
            beverages: 'Beverages',
            snacks: 'Snacks',
            candy: 'Candy',
            tobacco: 'Tobacco',
            health: 'Health',
            automotive: 'Automotive'
        };
        return categoryNames[category] || category;
    }

    searchProducts(query) {
        const filtered = this.products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description?.toLowerCase().includes(query.toLowerCase()) ||
            product.barcode.includes(query) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        this.renderProducts(filtered);
    }

    filterByCategory(category) {
        if (category === 'all') {
            this.renderProducts();
        } else {
            const filtered = this.products.filter(product => product.category === category);
            this.renderProducts(filtered);
        }
    }

    showAddProductModal() {
        this.currentEditId = null;
        document.getElementById('modal-title').textContent = 'Add New Product';
        document.getElementById('product-form').reset();
        document.getElementById('product-modal').classList.remove('hidden');
        
        // Generate random barcode
        const randomBarcode = Math.floor(Math.random() * 900000000000) + 100000000000;
        document.getElementById('product-barcode').value = randomBarcode.toString();
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.currentEditId = productId;
        document.getElementById('modal-title').textContent = 'Edit Product';
        
        // Fill form with product data
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-cost').value = product.cost;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-barcode').value = product.barcode;
        document.getElementById('product-image').value = product.image || '';
        document.getElementById('product-description').value = product.description || '';
        
        document.getElementById('product-modal').classList.remove('hidden');
    }

    adjustStock(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const newStock = prompt(`Adjust stock for "${product.name}"\nCurrent stock: ${product.stock}\n\nEnter new stock quantity:`, product.stock);
        
        if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
            product.stock = parseInt(newStock);
            this.saveProducts();
            this.showNotification(`Stock updated for ${product.name}`, 'success');
        }
    }

    deleteProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.showNotification(`${product.name} deleted successfully`, 'success');
        }
    }

    saveProduct() {
        const formData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            cost: parseFloat(document.getElementById('product-cost').value),
            stock: parseInt(document.getElementById('product-stock').value),
            barcode: document.getElementById('product-barcode').value,
            image: document.getElementById('product-image').value,
            description: document.getElementById('product-description').value
        };

        // Validation
        if (!formData.name || !formData.category || !formData.barcode) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (formData.price < 0 || formData.cost < 0 || formData.stock < 0) {
            this.showNotification('Price, cost, and stock must be non-negative', 'error');
            return;
        }

        if (this.currentEditId) {
            // Update existing product
            const productIndex = this.products.findIndex(p => p.id === this.currentEditId);
            if (productIndex !== -1) {
                this.products[productIndex] = { ...this.products[productIndex], ...formData };
                this.showNotification('Product updated successfully', 'success');
            }
        } else {
            // Add new product
            const newProduct = {
                id: this.generateProductId(),
                ...formData
            };
            this.products.push(newProduct);
            this.showNotification('Product added successfully', 'success');
        }

        this.saveProducts();
        this.closeModal();
    }

    generateProductId() {
        const prefix = document.getElementById('product-category').value.charAt(0);
        const randomNum = Math.floor(Math.random() * 1000) + 1;
        return `${prefix}${randomNum}`;
    }

    saveProducts() {
        localStorage.setItem('pos_products', JSON.stringify(this.products));
        this.renderProducts();
        this.updateStats();
    }

    closeModal() {
        document.getElementById('product-modal').classList.add('hidden');
        this.currentEditId = null;
    }

    exportData() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Inventory data exported successfully', 'success');
    }

    generateCSV() {
        const headers = ['ID', 'Name', 'Category', 'Price', 'Cost', 'Stock', 'Barcode', 'Description'];
        const rows = this.products.map(product => [
            product.id,
            product.name,
            product.category,
            product.price,
            product.cost,
            product.stock,
            product.barcode,
            product.description || ''
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Quick Actions for Inventory
    bulkUpdateStock() {
        const lowStockProducts = this.products.filter(p => p.stock < 20);
        if (lowStockProducts.length === 0) {
            this.showNotification('No low stock items found', 'info');
            return;
        }

        const confirmUpdate = confirm(`Found ${lowStockProducts.length} low stock items. Add 50 units to each?`);
        if (confirmUpdate) {
            lowStockProducts.forEach(product => {
                product.stock += 50;
            });
            this.saveProducts();
            this.showNotification('Bulk stock update completed', 'success');
        }
    }

    generateBarcodeLabels() {
        const products = this.products.slice(0, 10); // Generate for first 10 products
        let barcodeContent = '<div class="p-6"><h3 class="text-lg font-semibold mb-4">Barcode Labels</h3><div class="grid grid-cols-3 gap-4">';
        
        products.forEach(product => {
            barcodeContent += `
                <div class="border p-4 text-center">
                    <div class="text-sm font-medium">${product.name}</div>
                    <div class="text-xs text-gray-600 mb-2">$${product.price.toFixed(2)}</div>
                    <div class="text-xs font-mono bg-gray-100 p-2">${product.barcode}</div>
                </div>
            `;
        });
        
        barcodeContent += '</div></div>';
        
        // Create and show barcode modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Barcode Labels</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    ${barcodeContent}
                    <div class="mt-6 flex space-x-3">
                        <button onclick="window.print()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            🖨️ Print Labels
                        </button>
                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    printPriceTags() {
        const products = this.products.slice(0, 8);
        let priceTagContent = '<div class="p-6"><h3 class="text-lg font-semibold mb-4">Price Tags</h3><div class="grid grid-cols-2 gap-4">';
        
        products.forEach(product => {
            priceTagContent += `
                <div class="border-2 border-dashed border-gray-300 p-4 text-center bg-white">
                    <div class="text-lg font-bold">$${product.price.toFixed(2)}</div>
                    <div class="text-sm font-medium mt-2">${product.name}</div>
                    <div class="text-xs text-gray-600 mt-1">${product.category}</div>
                    <div class="text-xs font-mono mt-2 bg-gray-100 p-1">${product.barcode}</div>
                </div>
            `;
        });
        
        priceTagContent += '</div></div>';
        
        // Create and show price tag modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Price Tags</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    ${priceTagContent}
                    <div class="mt-6 flex space-x-3">
                        <button onclick="window.print()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            🖨️ Print Tags
                        </button>
                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    importProducts() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const csv = e.target.result;
                    const lines = csv.split('\n');
                    const headers = lines[0].split(',');
                    
                    let importedCount = 0;
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim()) {
                            const values = lines[i].split(',');
                            const productData = {};
                            headers.forEach((header, index) => {
                                productData[header.trim()] = values[index] ? values[index].trim() : '';
                            });
                            
                            if (productData.Name && productData.Category) {
                                const newProduct = {
                                    id: this.generateProductId(),
                                    name: productData.Name,
                                    category: productData.Category.toLowerCase(),
                                    price: parseFloat(productData.Price) || 0,
                                    cost: parseFloat(productData.Cost) || 0,
                                    stock: parseInt(productData.Stock) || 0,
                                    barcode: productData.Barcode || this.generateBarcode(),
                                    image: productData.Image || '',
                                    description: productData.Description || ''
                                };
                                
                                this.products.push(newProduct);
                                importedCount++;
                            }
                        }
                    }
                    
                    this.saveProducts();
                    this.showNotification(`${importedCount} products imported successfully`, 'success');
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    generateBarcode() {
        return Math.floor(Math.random() * 900000000000) + 100000000000;
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
        
        notification.classList.remove('translate-x-full');
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
        }, 3000);
    }
}

// Initialize inventory manager
const inventoryManager = new InventoryManager();

// Global functions for HTML onclick handlers
function clearCart() {
    if (typeof pos !== 'undefined') {
        pos.clearCart();
    }
}

function processPayment(method) {
    if (typeof pos !== 'undefined') {
        pos.processPayment(method);
    }
}

function printReceipt() {
    if (typeof pos !== 'undefined') {
        pos.printReceipt();
    }
}

function showNotification(message, type) {
    if (typeof inventoryManager !== 'undefined') {
        inventoryManager.showNotification(message, type);
    }
}

function closeReceiptModal() {
    const modal = document.getElementById('receipt-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function printReceiptContent() {
    window.print();
}
