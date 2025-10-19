// Transaction History and Receipt Management
class TransactionManager {
    constructor() {
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentTransaction = null;
        this.init();
    }

    init() {
        this.loadTransactions();
        this.setupEventListeners();
        this.updateClock();
        this.applyFilters();
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

    loadTransactions() {
        const stored = localStorage.getItem('pos_transactions');
        if (stored) {
            this.transactions = JSON.parse(stored);
        } else {
            this.generateSampleTransactions();
        }
        this.filteredTransactions = [...this.transactions];
    }

    generateSampleTransactions() {
        // Generate sample transactions for demonstration
        const sampleTransactions = [];
        const products = [
            { id: 'b1', name: 'Coca-Cola', price: 2.49 },
            { id: 'b2', name: 'Pepsi', price: 2.39 },
            { id: 'b3', name: 'Red Bull', price: 3.99 },
            { id: 's1', name: 'Lay\'s Classic', price: 1.99 },
            { id: 's2', name: 'Doritos Nacho', price: 2.29 },
            { id: 'c1', name: 'Snickers', price: 1.49 },
            { id: 'c2', name: 'Mars Bar', price: 1.49 },
            { id: 'c3', name: 'KitKat', price: 1.39 }
        ];
        
        const paymentMethods = ['cash', 'card', 'digital'];
        const now = new Date();
        
        for (let i = 0; i < 50; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const transactionDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
            
            const numItems = Math.floor(Math.random() * 4) + 1;
            const items = [];
            let subtotal = 0;
            
            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const total = product.price * quantity;
                
                items.push({
                    productId: product.id,
                    name: product.name,
                    quantity: quantity,
                    price: product.price,
                    total: total
                });
                
                subtotal += total;
            }
            
            const tax = subtotal * 0.08;
            const total = subtotal + tax;
            
            sampleTransactions.push({
                id: `TXN-${transactionDate.toISOString().slice(0, 10).replace(/-/g, '')}-${i.toString().padStart(4, '0')}`,
                timestamp: transactionDate.toISOString(),
                items: items,
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                totals: {
                    subtotal: subtotal,
                    tax: tax,
                    total: total,
                    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
                },
                cashier: 'John Smith',
                store: 'QuickMart - Terminal #1',
                status: 'completed'
            });
        }
        
        this.transactions = sampleTransactions;
        localStorage.setItem('pos_transactions', JSON.stringify(this.transactions));
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('transaction-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Filter controls
        ['date-filter', 'payment-filter', 'amount-filter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.currentPage = 1;
                    this.applyFilters();
                });
            }
        });
    }

    applyFilters() {
        const searchTerm = document.getElementById('transaction-search')?.value.toLowerCase() || '';
        const dateFilter = document.getElementById('date-filter')?.value || 'all';
        const paymentFilter = document.getElementById('payment-filter')?.value || 'all';
        const amountFilter = document.getElementById('amount-filter')?.value || 'all';
        
        this.filteredTransactions = this.transactions.filter(transaction => {
            // Search filter
            if (searchTerm && !transaction.id.toLowerCase().includes(searchTerm) && 
                !transaction.totals.total.toFixed(2).includes(searchTerm)) {
                return false;
            }
            
            // Date filter
            if (dateFilter !== 'all') {
                const transactionDate = new Date(transaction.timestamp);
                const now = new Date();
                let isValid = false;
                
                switch (dateFilter) {
                    case 'today':
                        isValid = transactionDate.toDateString() === now.toDateString();
                        break;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        isValid = transactionDate >= weekAgo;
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        isValid = transactionDate >= monthAgo;
                        break;
                }
                
                if (!isValid) return false;
            }
            
            // Payment method filter
            if (paymentFilter !== 'all' && transaction.paymentMethod !== paymentFilter) {
                return false;
            }
            
            // Amount filter
            if (amountFilter !== 'all') {
                const total = transaction.totals.total;
                let isValid = false;
                
                switch (amountFilter) {
                    case '0-10':
                        isValid = total >= 0 && total <= 10;
                        break;
                    case '10-25':
                        isValid = total > 10 && total <= 25;
                        break;
                    case '25-50':
                        isValid = total > 25 && total <= 50;
                        break;
                    case '50+':
                        isValid = total > 50;
                        break;
                }
                
                if (!isValid) return false;
            }
            
            return true;
        });
        
        this.updateSummary();
        this.renderTransactions();
    }

    updateSummary() {
        const count = this.filteredTransactions.length;
        const revenue = this.filteredTransactions.reduce((sum, t) => sum + t.totals.total, 0);
        const avg = count > 0 ? revenue / count : 0;
        const items = this.filteredTransactions.reduce((sum, t) => sum + t.totals.itemCount, 0);
        
        document.getElementById('filtered-count').textContent = count;
        document.getElementById('filtered-revenue').textContent = `$${revenue.toFixed(2)}`;
        document.getElementById('filtered-avg').textContent = `$${avg.toFixed(2)}`;
        document.getElementById('filtered-items').textContent = items;
    }

    renderTransactions() {
        const tableBody = document.getElementById('transactions-table-body');
        if (!tableBody) return;
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageTransactions = this.filteredTransactions.slice(startIndex, endIndex);
        
        tableBody.innerHTML = pageTransactions.map(transaction => {
            const date = new Date(transaction.timestamp);
            const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            return `
                <tr class="hover:bg-gray-50 cursor-pointer" onclick="transactionManager.showTransactionDetails('${transaction.id}')">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 mono">
                        ${transaction.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${timeString}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${transaction.totals.itemCount} items
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 mono">
                        $${transaction.totals.subtotal.toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 mono">
                        $${transaction.totals.tax.toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 mono">
                        $${transaction.totals.total.toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getPaymentMethodColor(transaction.paymentMethod)}">
                            ${this.getPaymentMethodIcon(transaction.paymentMethod)} ${transaction.paymentMethod}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="event.stopPropagation(); transactionManager.showTransactionDetails('${transaction.id}')" 
                                class="text-blue-600 hover:text-blue-900 mr-2">
                            👁️
                        </button>
                        <button onclick="event.stopPropagation(); transactionManager.printReceipt('${transaction.id}')" 
                                class="text-orange-600 hover:text-orange-900 mr-2">
                            🖨️
                        </button>
                        <button onclick="event.stopPropagation(); transactionManager.processRefund('${transaction.id}')" 
                                class="text-red-600 hover:text-red-900">
                            💸
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.updatePagination();
        
        // Animate rows
        anime({
            targets: '#transactions-table-body tr',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(30),
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    getPaymentMethodColor(method) {
        const colors = {
            cash: 'bg-green-100 text-green-800',
            card: 'bg-blue-100 text-blue-800',
            digital: 'bg-purple-100 text-purple-800'
        };
        return colors[method] || 'bg-gray-100 text-gray-800';
    }

    getPaymentMethodIcon(method) {
        const icons = {
            cash: '💵',
            card: '💳',
            digital: '📱'
        };
        return icons[method] || '💰';
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredTransactions.length);
        
        document.getElementById('current-page').textContent = this.currentPage;
        document.getElementById('total-pages').textContent = totalPages;
        document.getElementById('showing-count').textContent = endIndex - startIndex;
        document.getElementById('total-count').textContent = this.filteredTransactions.length;
        
        // Update button states
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= totalPages;
        
        prevBtn.classList.toggle('opacity-50', this.currentPage <= 1);
        prevBtn.classList.toggle('cursor-not-allowed', this.currentPage <= 1);
        nextBtn.classList.toggle('opacity-50', this.currentPage >= totalPages);
        nextBtn.classList.toggle('cursor-not-allowed', this.currentPage >= totalPages);
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTransactions();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTransactions();
        }
    }

    showTransactionDetails(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        this.currentTransaction = transaction;
        document.getElementById('modal-transaction-id').textContent = `Transaction: ${transaction.id}`;
        
        const date = new Date(transaction.timestamp);
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        const detailsHtml = `
            <div class="grid grid-cols-2 gap-6 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-2">Transaction Info</h4>
                    <div class="space-y-1 text-sm">
                        <div><span class="text-gray-600">Date:</span> ${timeString}</div>
                        <div><span class="text-gray-600">Cashier:</span> ${transaction.cashier}</div>
                        <div><span class="text-gray-600">Terminal:</span> ${transaction.store}</div>
                        <div><span class="text-gray-600">Status:</span> <span class="text-green-600 font-medium">${transaction.status}</span></div>
                    </div>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-2">Payment Info</h4>
                    <div class="space-y-1 text-sm">
                        <div><span class="text-gray-600">Method:</span> <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${this.getPaymentMethodColor(transaction.paymentMethod)}">${this.getPaymentMethodIcon(transaction.paymentMethod)} ${transaction.paymentMethod}</span></div>
                        <div><span class="text-gray-600">Items:</span> ${transaction.totals.itemCount}</div>
                        <div><span class="text-gray-600">Subtotal:</span> <span class="mono">$${transaction.totals.subtotal.toFixed(2)}</span></div>
                        <div><span class="text-gray-600">Tax:</span> <span class="mono">$${transaction.totals.tax.toFixed(2)}</span></div>
                        <div><span class="text-gray-600">Total:</span> <span class="mono font-semibold text-lg">$${transaction.totals.total.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold text-gray-800 mb-3">Items Purchased</h4>
                <div class="bg-gray-50 rounded-lg p-4">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b">
                                <th class="text-left py-2 text-sm font-medium text-gray-600">Item</th>
                                <th class="text-center py-2 text-sm font-medium text-gray-600">Qty</th>
                                <th class="text-right py-2 text-sm font-medium text-gray-600">Price</th>
                                <th class="text-right py-2 text-sm font-medium text-gray-600">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transaction.items.map(item => `
                                <tr class="border-b border-gray-200">
                                    <td class="py-2 text-sm">${item.name}</td>
                                    <td class="py-2 text-sm text-center">${item.quantity}</td>
                                    <td class="py-2 text-sm text-right mono">$${item.price.toFixed(2)}</td>
                                    <td class="py-2 text-sm text-right mono font-medium">$${item.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('transaction-details').innerHTML = detailsHtml;
        document.getElementById('transaction-modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('transaction-modal').classList.add('hidden');
        this.currentTransaction = null;
    }

    printReceipt(transactionId = null) {
        const transaction = transactionId ? 
            this.transactions.find(t => t.id === transactionId) : 
            this.currentTransaction;
        
        if (!transaction) return;
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        const date = new Date(transaction.timestamp);
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        const receiptContent = `
            <html>
            <head>
                <title>Receipt - ${transaction.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .receipt { max-width: 300px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    .items { margin-bottom: 20px; }
                    .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .total { border-top: 1px dashed #000; padding-top: 10px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h2>QuickMart</h2>
                        <p>Terminal #1</p>
                        <p>${timeString}</p>
                        <p>Receipt: ${transaction.id}</p>
                    </div>
                    
                    <div class="items">
                        ${transaction.items.map(item => `
                            <div class="item">
                                <span>${item.name} x ${item.quantity}</span>
                                <span>$${item.total.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="total">
                        <div class="item">
                            <span>Subtotal:</span>
                            <span>$${transaction.totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="item">
                            <span>Tax:</span>
                            <span>$${transaction.totals.tax.toFixed(2)}</span>
                        </div>
                        <div class="item">
                            <span>Total:</span>
                            <span>$${transaction.totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Payment: ${transaction.paymentMethod}</p>
                        <p>Cashier: ${transaction.cashier}</p>
                        <p>Thank you for shopping with us!</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.print();
        
        this.showNotification('Receipt sent to printer', 'success');
    }

    processRefund(transactionId = null) {
        const transaction = transactionId ? 
            this.transactions.find(t => t.id === transactionId) : 
            this.currentTransaction;
        
        if (!transaction) return;
        
        if (confirm(`Process refund for transaction ${transaction.id}?\nTotal amount: $${transaction.totals.total.toFixed(2)}`)) {
            // In a real system, this would process the refund
            // For demo purposes, we'll just show a notification
            this.showNotification(`Refund processed for $${transaction.totals.total.toFixed(2)}`, 'success');
            
            // Optionally mark transaction as refunded
            transaction.status = 'refunded';
            localStorage.setItem('pos_transactions', JSON.stringify(this.transactions));
            
            this.closeModal();
            this.applyFilters();
        }
    }

    generateDailyReport() {
        const today = new Date();
        const todayTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.timestamp);
            return transactionDate.toDateString() === today.toDateString();
        });
        
        const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.totals.total, 0);
        const totalTransactions = todayTransactions.length;
        const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        const totalItems = todayTransactions.reduce((sum, t) => sum + t.totals.itemCount, 0);
        
        const paymentBreakdown = {};
        todayTransactions.forEach(t => {
            if (!paymentBreakdown[t.paymentMethod]) {
                paymentBreakdown[t.paymentMethod] = { count: 0, total: 0 };
            }
            paymentBreakdown[t.paymentMethod].count++;
            paymentBreakdown[t.paymentMethod].total += t.totals.total;
        });
        
        const reportContent = `
            <div class="mb-6">
                <h4 class="text-lg font-semibold mb-4">Daily Sales Report - ${today.toLocaleDateString()}</h4>
                
                <div class="grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-blue-600">${totalTransactions}</div>
                        <div class="text-sm text-blue-800">Transactions</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-green-600 mono">$${totalRevenue.toFixed(2)}</div>
                        <div class="text-sm text-green-800">Total Revenue</div>
                    </div>
                    <div class="bg-orange-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-orange-600 mono">$${avgTransaction.toFixed(2)}</div>
                        <div class="text-sm text-orange-800">Avg Transaction</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-purple-600">${totalItems}</div>
                        <div class="text-sm text-purple-800">Items Sold</div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h5 class="font-semibold mb-3">Payment Method Breakdown</h5>
                    <div class="grid grid-cols-3 gap-4">
                        ${Object.entries(paymentBreakdown).map(([method, data]) => `
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <div class="flex items-center mb-2">
                                    <span class="mr-2">${this.getPaymentMethodIcon(method)}</span>
                                    <span class="font-medium capitalize">${method}</span>
                                </div>
                                <div class="text-sm">
                                    <div>Transactions: ${data.count}</div>
                                    <div class="mono">Total: $${data.total.toFixed(2)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${todayTransactions.length > 0 ? `
                <div>
                    <h5 class="font-semibold mb-3">Transaction Details</h5>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b">
                                    <th class="text-left py-2">Transaction ID</th>
                                    <th class="text-left py-2">Time</th>
                                    <th class="text-right py-2">Total</th>
                                    <th class="text-left py-2">Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${todayTransactions.slice(0, 20).map(t => `
                                    <tr class="border-b">
                                        <td class="py-2 mono">${t.id}</td>
                                        <td class="py-2">${new Date(t.timestamp).toLocaleTimeString()}</td>
                                        <td class="py-2 text-right mono">$${t.totals.total.toFixed(2)}</td>
                                        <td class="py-2">${t.paymentMethod}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : '<p class="text-gray-600">No transactions today.</p>'}
            </div>
        `;
        
        document.getElementById('report-content').innerHTML = reportContent;
        document.getElementById('report-modal').classList.remove('hidden');
    }

    closeReportModal() {
        document.getElementById('report-modal').classList.add('hidden');
    }

    printReport() {
        window.print();
    }

    exportTransactions() {
        const headers = ['Transaction ID', 'Date', 'Time', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment Method', 'Cashier', 'Status'];
        const rows = this.transactions.map(transaction => {
            const date = new Date(transaction.timestamp);
            return [
                transaction.id,
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                transaction.totals.itemCount,
                transaction.totals.subtotal.toFixed(2),
                transaction.totals.tax.toFixed(2),
                transaction.totals.total.toFixed(2),
                transaction.paymentMethod,
                transaction.cashier,
                transaction.status
            ];
        });
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Transaction data exported successfully', 'success');
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

// Initialize transaction manager
const transactionManager = new TransactionManager();

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
    if (typeof transactionManager !== 'undefined') {
        transactionManager.showNotification(message, type);
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
