// POS-specific functionality - Payment processing and receipt generation

class POSFunctions {
    constructor() {
        this.taxes = {
            rate: 0.08, // 8% tax rate
            enabled: true
        };
        
        this.paymentMethods = {
            cash: { name: 'Cash', icon: '💵', color: 'green' },
            card: { name: 'Credit/Debit Card', icon: '💳', color: 'blue' },
            digital: { name: 'Digital Payment', icon: '📱', color: 'purple' }
        };
    }

    calculateTotals(cart) {
        const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
        
        // Apply discount if exists
        let discountAmount = 0;
        if (pos.discount.value > 0) {
            if (pos.discount.type === 'percentage') {
                discountAmount = subtotal * (pos.discount.value / 100);
            } else {
                discountAmount = pos.discount.value;
            }
        }
        
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const tax = this.taxes.enabled ? taxableAmount * this.taxes.rate : 0;
        const total = taxableAmount + tax;
        
        return {
            subtotal: subtotal,
            discount: discountAmount,
            taxableAmount: taxableAmount,
            tax: tax,
            total: total,
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    async processPayment(method) {
        if (pos.cart.length === 0) {
            pos.showNotification('Cart is empty!', 'warning');
            return;
        }

        if (pos.isProcessingPayment) {
            pos.showNotification('Payment already in progress!', 'warning');
            return;
        }

        pos.isProcessingPayment = true;
        
        try {
            // Show processing animation
            this.showPaymentProcessing(method);
            
            // Simulate payment processing delay
            await this.simulatePaymentProcessing(method);
            
            // Complete transaction
            const transaction = this.completeTransaction(method);
            
            // Show success message
            this.showPaymentSuccess(method, transaction);
            
            // Generate and show receipt
            this.generateReceipt(transaction);
            
            // Clear cart and prepare for next transaction
            setTimeout(() => {
                pos.clearCart();
                pos.currentTransactionId = pos.generateTransactionId();
                document.getElementById('transaction-id').textContent = pos.currentTransactionId;
                pos.isProcessingPayment = false;
            }, 2000);
            
        } catch (error) {
            pos.showNotification('Payment failed. Please try again.', 'error');
            pos.isProcessingPayment = false;
        }
    }

    showPaymentProcessing(method) {
        const methodInfo = this.paymentMethods[method];
        
        // Create processing overlay
        const overlay = document.createElement('div');
        overlay.id = 'payment-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        overlay.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
                <div class="text-6xl mb-4">${methodInfo.icon}</div>
                <h3 class="text-xl font-semibold mb-2">Processing ${methodInfo.name}</h3>
                <div class="flex justify-center mb-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-${methodInfo.color}-500"></div>
                </div>
                <p class="text-gray-600">Please wait...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Animate overlay
        anime({
            targets: overlay,
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    async simulatePaymentProcessing(method) {
        // Simulate different processing times for different payment methods
        const processingTimes = {
            cash: 1000,
            card: 2500,
            digital: 2000
        };
        
        await new Promise(resolve => setTimeout(resolve, processingTimes[method] || 2000));
    }

    completeTransaction(method) {
        const totals = this.calculateTotals(pos.cart);
        const transaction = {
            id: pos.currentTransactionId,
            timestamp: new Date().toISOString(),
            items: [...pos.cart],
            paymentMethod: method,
            totals: totals,
            cashier: 'John Smith', // This would come from user session
            store: 'QuickMart - Terminal #1',
            discount: pos.discount.value > 0 ? { ...pos.discount } : null
        };
        
        // Save transaction to localStorage
        const transactions = JSON.parse(localStorage.getItem('pos_transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('pos_transactions', JSON.stringify(transactions));
        
        // Update product stock
        pos.cart.forEach(cartItem => {
            const product = pos.products.find(p => p.id === cartItem.id);
            if (product) {
                product.stock -= cartItem.quantity;
            }
        });
        
        // Save updated products
        localStorage.setItem('pos_products', JSON.stringify(pos.products));
        
        return transaction;
    }

    showPaymentSuccess(method, transaction) {
        // Remove processing overlay
        const overlay = document.getElementById('payment-overlay');
        if (overlay) {
            anime({
                targets: overlay,
                opacity: [1, 0],
                duration: 300,
                easing: 'easeOutQuad',
                complete: () => overlay.remove()
            });
        }
        
        const methodInfo = this.paymentMethods[method];
        pos.showNotification(`${methodInfo.name} payment successful!`, 'success');
    }

    generateReceipt(transaction) {
        const modal = document.getElementById('receipt-modal');
        const content = document.getElementById('receipt-content');
        
        const date = new Date(transaction.timestamp);
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        const methodInfo = this.paymentMethods[transaction.paymentMethod];
        
        content.innerHTML = `
            <div class="text-center mb-4 border-b pb-4">
                <div class="text-lg font-bold">${transaction.store}</div>
                <div class="text-sm text-gray-600">Receipt #: ${transaction.id}</div>
                <div class="text-sm text-gray-600">${timeString}</div>
                <div class="text-sm text-gray-600">Cashier: ${transaction.cashier}</div>
            </div>
            
            <div class="mb-4">
                <div class="font-medium mb-2">Items:</div>
                ${transaction.items.map(item => `
                    <div class="flex justify-between text-sm mb-1">
                        <span>${item.name} × ${item.quantity}</span>
                        <span class="mono">$${item.total.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            
            ${transaction.discount ? `
            <div class="mb-4">
                <div class="flex justify-between text-sm text-green-600 mb-1">
                    <span>Discount (${transaction.discount.type === 'percentage' ? transaction.discount.value + '%' : '$' + transaction.discount.value}):</span>
                    <span class="mono">-$${transaction.totals.discount.toFixed(2)}</span>
                </div>
                ${transaction.discount.reason ? `<div class="text-xs text-gray-500">${transaction.discount.reason}</div>` : ''}
            </div>
            ` : ''}
            
            <div class="border-t pt-4 space-y-1">
                <div class="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span class="mono">$${transaction.totals.subtotal.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span class="mono">$${transaction.totals.tax.toFixed(2)}</span>
                </div>
                <div class="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span class="mono">$${transaction.totals.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="mt-4 text-center text-sm text-gray-600">
                <div>Payment: ${methodInfo.icon} ${methodInfo.name}</div>
                <div class="mt-2">Thank you for shopping with us!</div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        
        // Animate modal
        anime({
            targets: modal.querySelector('.bg-white'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutBack'
        });
    }

    printReceipt() {
        if (pos.cart.length === 0) {
            pos.showNotification('No items to print receipt for!', 'warning');
            return;
        }
        
        // Generate receipt for current cart state
        const totals = this.calculateTotals(pos.cart);
        const receiptData = {
            id: pos.currentTransactionId,
            timestamp: new Date().toISOString(),
            items: [...pos.cart],
            totals: totals,
            cashier: 'John Smith',
            store: 'QuickMart - Terminal #1',
            discount: pos.discount.value > 0 ? { ...pos.discount } : null
        };
        
        this.generateReceipt(receiptData);
    }
}

// Extend the main POS class with payment functionality
QuickMartPOS.prototype.processPayment = function(method) {
    const posFunctions = new POSFunctions();
    return posFunctions.processPayment(method);
};

QuickMartPOS.prototype.printReceipt = function() {
    const posFunctions = new POSFunctions();
    return posFunctions.printReceipt();
};

// Add keyboard shortcuts for payment methods
document.addEventListener('keydown', (e) => {
    if (e.key === 'F3') {
        e.preventDefault();
        pos.processPayment('cash');
    } else if (e.key === 'F4') {
        e.preventDefault();
        pos.processPayment('card');
    } else if (e.key === 'F5') {
        e.preventDefault();
        pos.processPayment('digital');
    }
});