let currentUser = null;
let barChart = null;
let pieChart = null;

function loadUsers() {
    return JSON.parse(localStorage.getItem('users')) || {};
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function handleSignUp(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!username || !password) {
        alert('Please fill out both fields!');
        return;
    }

    const users = loadUsers();
    if (users[username]) {
        alert('User already exists! Please sign in.');
    } else {
        users[username] = { password, transactions: [] };
        saveUsers(users);
        alert('User registered successfully!');
        switchToSignIn();
    }

    document.getElementById('signup-form').reset();
}

function handleSignIn(e) {
    e.preventDefault();
    const username = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value;

    const users = loadUsers();
    if (users[username] && users[username].password === password) {
        currentUser = username;
        alert('Login successful!');
        showExpenseTracker();
    } else {
        alert('Invalid username or password!');
    }

    document.getElementById('signin-form').reset();
}

function showExpenseTracker() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('signin-page').style.display = 'none';
    document.getElementById('expense-tracker').style.display = 'block';
    init();
}

function logout() {
    currentUser = null;
    transactions = [];
    document.getElementById('signup-page').style.display = 'block';
    document.getElementById('expense-tracker').style.display = 'none';
}

function switchToSignUp() {
    document.getElementById('signup-page').style.display = 'block';
    document.getElementById('signin-page').style.display = 'none';
}

function switchToSignIn() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('signin-page').style.display = 'block';
}

function loadTransactions() {
    const users = loadUsers();
    return currentUser ? users[currentUser].transactions : [];
}

function saveTransactions(transactions) {
    const users = loadUsers();
    if (currentUser) {
        users[currentUser].transactions = transactions;
        saveUsers(users);
    }
}

function addTransaction(e) {
    e.preventDefault();
    const text = document.getElementById('text').value.trim();
    const amount = +document.getElementById('amount').value;
    const date = document.getElementById('date').value;

    if (!text || isNaN(amount) || !date) {
        alert('Please enter valid description, amount, and date!');
        return;
    }

    const transaction = { id: generateID(), text, amount, date };
    transactions.push(transaction);
    saveTransactions(transactions);

    addTransactionDOM(transaction);
    updateValues();

    document.getElementById('transaction-form').reset();
}

function generateID() {
    return Math.floor(Math.random() * 1000000);
}

function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');
    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
    item.innerHTML = `
        ${transaction.text} <span>${sign}$${Math.abs(transaction.amount)}</span> <span>${transaction.date}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;
    document.getElementById('transaction-list').appendChild(item);
}

function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
    const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => acc + item, 0).toFixed(2);
    const expense = amounts.filter(item => item < 0).reduce((acc, item) => acc + item, 0).toFixed(2);

    document.getElementById('balance').innerText = `$${total}`;
    document.getElementById('money-plus').innerText = `$${income}`;
    document.getElementById('money-minus').innerText = `$${Math.abs(expense)}`;

    renderCharts(transactions);
}

function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    saveTransactions(transactions);
    init();
}

function renderCharts(transactions) {
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const barCtx = document.getElementById('transactions-chart').getContext('2d');
    if (barChart) barChart.destroy();
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: transactions.map(t => t.date),
            datasets: [{
                label: 'Transactions',
                data: transactions.map(t => t.amount),
                backgroundColor: transactions.map(t => t.amount < 0 ? 'red' : 'green'),
                borderColor: 'black',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            }
        }
    });

    const pieCtx = document.getElementById('transactions-pie-chart').getContext('2d');
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['green', 'red'],
                borderColor: ['black', 'black'],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: $${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function init() {
    document.getElementById('transaction-list').innerHTML = '';
    transactions = loadTransactions();
    transactions.forEach(addTransactionDOM);
    updateValues();
}

document.getElementById('signup-form').addEventListener('submit', handleSignUp);
document.getElementById('signin-form').addEventListener('submit', handleSignIn);
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('go-to-signin').addEventListener('click', switchToSignIn);
document.getElementById('go-to-signup').addEventListener('click', switchToSignUp);
document.getElementById('transaction-form').addEventListener('submit', addTransaction);

let transactions = [];
