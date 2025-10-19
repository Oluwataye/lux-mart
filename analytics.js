// Sales Analytics Dashboard
class AnalyticsDashboard {
    constructor() {
        this.transactions = [];
        this.products = [];
        this.charts = {};
        this.dateRange = 'month';
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateClock();
        this.updateDashboard();
        this.initializeCharts();
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

    loadData() {
        // Load transactions
        const storedTransactions = localStorage.getItem('pos_transactions');
        this.transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
        
        // Load products
        const storedProducts = localStorage.getItem('pos_products');
        this.products = storedProducts ? JSON.parse(storedProducts) : [];
        
        // Generate sample data if no transactions exist
        if (this.transactions.length === 0) {
            this.generateSampleData();
        }
    }

    generateSampleData() {
        const sampleTransactions = [];
        const products = this.products;
        const paymentMethods = ['cash', 'card', 'digital'];
        const now = new Date();
        
        // Generate transactions for the last 30 days
        for (let i = 0; i < 100; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const transactionDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
            
            const numItems = Math.floor(Math.random() * 5) + 1;
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
                store: 'QuickMart - Terminal #1'
            });
        }
        
        this.transactions = sampleTransactions;
        localStorage.setItem('pos_transactions', JSON.stringify(this.transactions));
    }

    setupEventListeners() {
        const dateRangeSelector = document.getElementById('date-range');
        if (dateRangeSelector) {
            dateRangeSelector.addEventListener('change', (e) => {
                this.dateRange = e.target.value;
                this.updateDashboard();
                this.updateCharts();
            });
        }
    }

    getFilteredTransactions() {
        const now = new Date();
        let startDate;
        
        switch (this.dateRange) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(0);
        }
        
        return this.transactions.filter(transaction => 
            new Date(transaction.timestamp) >= startDate
        );
    }

    updateDashboard() {
        const filteredTransactions = this.getFilteredTransactions();
        
        // Calculate KPIs
        const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.totals.total, 0);
        const totalTransactions = filteredTransactions.length;
        const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        const totalItems = filteredTransactions.reduce((sum, t) => sum + t.totals.itemCount, 0);
        
        // Update KPI displays
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('total-transactions').textContent = totalTransactions;
        document.getElementById('avg-transaction').textContent = `$${avgTransaction.toFixed(2)}`;
        document.getElementById('total-items').textContent = totalItems;
        
        // Update recent transactions table
        this.updateTransactionsTable(filteredTransactions.slice(0, 10));
    }

    updateTransactionsTable(transactions) {
        const tableBody = document.getElementById('transactions-table-body');
        if (!tableBody) return;
        
        tableBody.innerHTML = transactions.map(transaction => {
            const date = new Date(transaction.timestamp);
            const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 mono">
                        ${transaction.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${timeString}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${transaction.totals.itemCount} items
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 mono">
                        $${transaction.totals.total.toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getPaymentMethodColor(transaction.paymentMethod)}">
                            ${this.getPaymentMethodIcon(transaction.paymentMethod)} ${transaction.paymentMethod}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${transaction.cashier}
                    </td>
                </tr>
            `;
        }).join('');
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

    initializeCharts() {
        this.initRevenueChart();
        this.initProductsChart();
        this.initCategoryChart();
        this.initPaymentChart();
    }

    initRevenueChart() {
        const chartDom = document.getElementById('revenue-chart');
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);
        this.charts.revenue = myChart;
        
        const filteredTransactions = this.getFilteredTransactions();
        
        // Group transactions by date
        const dailyRevenue = {};
        filteredTransactions.forEach(transaction => {
            const date = new Date(transaction.timestamp).toDateString();
            if (!dailyRevenue[date]) {
                dailyRevenue[date] = 0;
            }
            dailyRevenue[date] += transaction.totals.total;
        });
        
        const dates = Object.keys(dailyRevenue).sort();
        const revenues = dates.map(date => dailyRevenue[date]);
        
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    return `${params[0].axisValue}<br/>Revenue: $${params[0].value.toFixed(2)}`;
                }
            },
            xAxis: {
                type: 'category',
                data: dates.map(date => new Date(date).toLocaleDateString()),
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '${value}'
                }
            },
            series: [{
                data: revenues,
                type: 'line',
                smooth: true,
                itemStyle: {
                    color: '#ff6b35'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(255, 107, 53, 0.3)'
                        }, {
                            offset: 1, color: 'rgba(255, 107, 53, 0.1)'
                        }]
                    }
                }
            }]
        };
        
        myChart.setOption(option);
    }

    initProductsChart() {
        const chartDom = document.getElementById('products-chart');
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);
        this.charts.products = myChart;
        
        const filteredTransactions = this.getFilteredTransactions();
        
        // Count product sales
        const productSales = {};
        filteredTransactions.forEach(transaction => {
            transaction.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = 0;
                }
                productSales[item.name] += item.quantity;
            });
        });
        
        // Get top 10 products
        const sortedProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'value'
            },
            yAxis: {
                type: 'category',
                data: sortedProducts.map(([name]) => name),
                axisLabel: {
                    interval: 0,
                    rotate: 0
                }
            },
            series: [{
                type: 'bar',
                data: sortedProducts.map(([, quantity]) => quantity),
                itemStyle: {
                    color: '#1a2332'
                }
            }]
        };
        
        myChart.setOption(option);
    }

    initCategoryChart() {
        const chartDom = document.getElementById('category-chart');
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);
        this.charts.category = myChart;
        
        const filteredTransactions = this.getFilteredTransactions();
        
        // Map product IDs to categories and calculate revenue
        const categoryRevenue = {};
        filteredTransactions.forEach(transaction => {
            transaction.items.forEach(item => {
                const product = this.products.find(p => p.id === item.productId);
                if (product) {
                    if (!categoryRevenue[product.category]) {
                        categoryRevenue[product.category] = 0;
                    }
                    categoryRevenue[product.category] += item.total;
                }
            });
        });
        
        const categoryNames = {
            beverages: 'Beverages',
            snacks: 'Snacks',
            candy: 'Candy',
            tobacco: 'Tobacco',
            health: 'Health',
            automotive: 'Automotive'
        };
        
        const data = Object.entries(categoryRevenue).map(([category, revenue]) => ({
            name: categoryNames[category] || category,
            value: revenue
        }));
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: ${c} ({d}%)'
            },
            series: [{
                name: 'Revenue',
                type: 'pie',
                radius: ['40%', '70%'],
                data: data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                itemStyle: {
                    color: function(params) {
                        const colors = ['#ff6b35', '#1a2332', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b'];
                        return colors[params.dataIndex % colors.length];
                    }
                }
            }]
        };
        
        myChart.setOption(option);
    }

    initPaymentChart() {
        const chartDom = document.getElementById('payment-chart');
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);
        this.charts.payment = myChart;
        
        const filteredTransactions = this.getFilteredTransactions();
        
        // Count payment methods
        const paymentCounts = {};
        filteredTransactions.forEach(transaction => {
            if (!paymentCounts[transaction.paymentMethod]) {
                paymentCounts[transaction.paymentMethod] = 0;
            }
            paymentCounts[transaction.paymentMethod]++;
        });
        
        const paymentNames = {
            cash: 'Cash',
            card: 'Credit/Debit Card',
            digital: 'Digital Payment'
        };
        
        const data = Object.entries(paymentCounts).map(([method, count]) => ({
            name: paymentNames[method] || method,
            value: count
        }));
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            series: [{
                name: 'Payment Methods',
                type: 'pie',
                radius: '70%',
                data: data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                itemStyle: {
                    color: function(params) {
                        const colors = ['#22c55e', '#3b82f6', '#8b5cf6'];
                        return colors[params.dataIndex % colors.length];
                    }
                }
            }]
        };
        
        myChart.setOption(option);
    }

    updateCharts() {
        // Reinitialize all charts with new data
        this.initRevenueChart();
        this.initProductsChart();
        this.initCategoryChart();
        this.initPaymentChart();
    }

    exportReport() {
        const filteredTransactions = this.getFilteredTransactions();
        
        // Generate CSV report
        const headers = ['Transaction ID', 'Date', 'Time', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment Method', 'Cashier'];
        const rows = filteredTransactions.map(transaction => {
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
                transaction.cashier
            ];
        });
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${this.dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Sales report exported successfully', 'success');
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

// Initialize analytics dashboard
const analytics = new AnalyticsDashboard();

// Handle window resize for charts
window.addEventListener('resize', () => {
    Object.values(analytics.charts).forEach(chart => {
        if (chart && chart.resize) {
            chart.resize();
        }
    });
});