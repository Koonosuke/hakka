// app.js

var historyData = [];
var incomeChart = null;
var expenseChart = null;
var monthlyBalanceChart = null;
var token = null;

document.addEventListener('DOMContentLoaded', function() {
    token = localStorage.getItem('token');
    if (token) {
        loadTransactions();
    } else {
        window.location.href = 'login.html';  // トークンがない場合はログインページにリダイレクト
    }
});

function loadTransactions() {
    fetch('/transactions?token=' + token, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
    })
    .then(response => response.json())
    .then(data => {
        historyData = data;
        displayHistory();
        updateGraphs();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// ユーザー登録
function registerUser() {
    var username = document.getElementById("registerUsername").value;
    var password = document.getElementById("registerPassword").value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('登録に失敗しました: ' + data.error);
        } else {
            alert('登録が成功しました');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// ユーザーログイン
function loginUser() {
    var username = document.getElementById("loginUsername").value;
    var password = document.getElementById("loginPassword").value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('ログインに失敗しました: ' + data.error);
        } else {
            alert('ログインが成功しました');
            token = data.token;
            loadTransactions();
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// 収入を追加する関数
function addIncome() {
    var name = document.getElementById("incomeName").value;
    var amount = parseFloat(document.getElementById("incomeAmount").value);
    if (!isNaN(amount) && amount > 0) {
        addTransaction(name, amount, 'income');
        document.getElementById("incomeName").value = "";
        document.getElementById("incomeAmount").value = "";
    }
}

// 支出を追加する関数
function addExpense() {
    var name = document.getElementById("expenseName").value;
    var amount = parseFloat(document.getElementById("expenseAmount").value);
    var type = document.getElementById("expenseType").value;
    if (!isNaN(amount) && amount > 0) {
        addTransaction(name, -amount, type);
        document.getElementById("expenseName").value = "";
        document.getElementById("expenseAmount").value = "";
    }
}

// 取引を追加する共通関数
function addTransaction(name, amount, type) {
    var dateInput = document.getElementById("date").value;
    if (dateInput) {
        var date = new Date(dateInput);

        fetch('/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ token: token, date: date.toISOString().split('T')[0], name: name, amount: amount, type: type }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('取引の追加に失敗しました: ' + data.error);
            } else {
                historyData.push(data);
                displayHistory();
                updateGraphs();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        alert("日付を指定してください。");
    }
}

// 取引をロードする関数
function loadTransactions() {
    fetch('/transactions?token=' + token, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
    })
    .then(response => response.json())
    .then(data => {
        historyData = data;
        displayHistory();
        updateGraphs();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// 履歴を表示する関数
function displayHistory() {
    var historyTable = document.getElementById("history");
    historyTable.innerHTML = "";
    var totalIncome = 0;
    var totalExpense = 0;

    historyData.forEach(function (item) {
        var row = document.createElement("tr");
        var dateCell = document.createElement("td");
        dateCell.textContent = new Date(item.date).toLocaleDateString();
        var nameCell = document.createElement("td");
        nameCell.textContent = item.name;
        var amountCell = document.createElement("td");
        amountCell.textContent = "¥" + item.amount.toLocaleString("ja-JP");
        var typeCell = document.createElement("td");
        typeCell.textContent = item.type === 'income' ? '収入' : (item.type === 'fixed' ? '固定費' : '変動費');

        row.appendChild(dateCell);
        row.appendChild(nameCell);
        row.appendChild(amountCell);
        row.appendChild(typeCell);
        historyTable.appendChild(row);

        // Calculate total income and expense
        if (item.type === 'income') {
            totalIncome += parseFloat(item.amount);
        } else {
            totalExpense += Math.abs(parseFloat(item.amount));
        }
    });

    // Update total and balance cells
    var totalIncomeCell = document.getElementById("totalIncome");
    var totalExpenseCell = document.getElementById("totalExpense");
    totalIncomeCell.textContent = "¥" + totalIncome.toLocaleString("ja-JP");
    totalExpenseCell.textContent = "¥" + totalExpense.toLocaleString("ja-JP");

    // Calculate and display balance
    var balance = totalIncome - totalExpense;
    var balanceCell = document.getElementById("balanceOfPayments");
    balanceCell.textContent = "¥" + balance.toLocaleString("ja-JP");
}


// 定義された色を使用してチャートを更新
var predefinedColors = [
    'rgb(255, 99, 132)',    // Red
    'rgb(54, 162, 235)',    // Blue
    'rgb(255, 205, 86)',    // Yellow
    'rgb(75, 192, 192)',    // Green
    'rgb(153, 102, 255)',   // Purple
    'rgb(255, 159, 64)',    // Orange
];

function updateGraphs() {
    var incomeLabels = [];
    var incomeData = [];
    var expenseLabels = [];
    var expenseData = [];
    var monthlyData = {};

    historyData.forEach(function (item) {
        var date = new Date(item.date);
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var monthKey = year + '-' + ('0' + month).slice(-2);

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, fixedExpense: 0, variableExpense: 0 };
        }

        var amount = parseFloat(item.amount);

        if (item.type === 'income') {
            incomeLabels.push(item.name);
            incomeData.push(amount);
            monthlyData[monthKey].income += amount;
        } else if (item.type === 'fixed') {
            expenseLabels.push(item.name);
            expenseData.push(Math.abs(amount));
            monthlyData[monthKey].fixedExpense += Math.abs(amount);
        } else if (item.type === 'variable') {
            expenseLabels.push(item.name);
            expenseData.push(Math.abs(amount));
            monthlyData[monthKey].variableExpense += Math.abs(amount);
        }
    });

    var incomeCtx = document.getElementById('incomeChart').getContext('2d');
    if (incomeChart) {
        incomeChart.destroy();
    }
    incomeChart = new Chart(incomeCtx, {
        type: 'pie',
        data: {
            labels: incomeLabels,
            datasets: [{
                label: '収入',
                backgroundColor: predefinedColors.slice(0, incomeData.length),
                data: incomeData
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.raw !== null) {
                                label += '¥' + context.raw.toLocaleString("ja-JP");
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    var expenseCtx = document.getElementById('expenseChart').getContext('2d');
    if (expenseChart) {
        expenseChart.destroy();
    }
    expenseChart = new Chart(expenseCtx, {
        type: 'pie',
        data: {
            labels: expenseLabels,
            datasets: [{
                label: '支出',
                backgroundColor: predefinedColors.slice(0, expenseData.length),
                data: expenseData
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.raw !== null) {
                                label += '¥' + context.raw.toLocaleString("ja-JP");
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    var monthlyLabels = Object.keys(monthlyData);
    var monthlyIncomeData = monthlyLabels.map(month => monthlyData[month].income);
    var monthlyFixedExpenseData = monthlyLabels.map(month => monthlyData[month].fixedExpense);
    var monthlyVariableExpenseData = monthlyLabels.map(month => monthlyData[month].variableExpense);
    var monthlyBalanceData = monthlyLabels.map(month => monthlyData[month].income - monthlyData[month].fixedExpense - monthlyData[month].variableExpense);

    var monthlyBalanceCtx = document.getElementById('monthlyBalanceChart').getContext('2d');
    if (monthlyBalanceChart) {
        monthlyBalanceChart.destroy();
    }
    monthlyBalanceChart = new Chart(monthlyBalanceCtx, {
        type: 'bar',
        data: {
            labels: monthlyLabels,
            datasets: [
                {
                    label: '収入',
                    backgroundColor: 'rgb(75, 192, 192)',
                    data: monthlyIncomeData
                },
                {
                    label: '固定費',
                    backgroundColor: 'rgb(255, 99, 132)',
                    data: monthlyFixedExpenseData
                },
                {
                    label: '変動費',
                    backgroundColor: 'rgb(54, 162, 235)',
                    data: monthlyVariableExpenseData
                },
                {
                    label: '収支',
                    backgroundColor: 'rgb(255, 205, 86)',
                    data: monthlyBalanceData
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '¥' + value.toLocaleString("ja-JP");
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.raw !== null) {
                                label += '¥' + context.raw.toLocaleString("ja-JP");
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}