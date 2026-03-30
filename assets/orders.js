 function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    function loadOrders() {
        axios.get('api/get_orders.php')
            .then(res => {

                let html = '';

                if (res.data.length === 0) {
                    document.getElementById('empty').style.display = 'block';
                    document.getElementById('orders').innerHTML = '';
                    return;
                }

                document.getElementById('empty').style.display = 'none';

                res.data.forEach(order => {
                    html += `
                        <div class="order-card">
                            <h4>${order.receipt_no}</h4>
                            <p><b>Total:</b> ${formatCurrency(order.total_amount)}</p>
                            <p><b>Date:</b> ${new Date(order.created_at).toLocaleString()}</p>
                        </div>
                    `;
                });

                document.getElementById('orders').innerHTML = html;
            })
            .catch(err => {
                console.error(err);
            });
    }

    //initial load
    loadOrders();

    //auto refresh every 5 sec
    setInterval(loadOrders, 5000);