document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = 'asset_management_app.html'; // ログイン成功後にメインページにリダイレクト
        } else {
            alert('ユーザー名またはパスワードが間違っています');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Login failed');
    });
});
