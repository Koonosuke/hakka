document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var errorMessage = document.getElementById('errorMessage');
    
    // APIに対してログインリクエストを送信
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // ログイン成功、トークンを保存し、ダッシュボードページにリダイレクト
            localStorage.setItem('token', data.token);
            window.location.href = 'asset_management_app.html';
        } else {
            // ログイン失敗、エラーメッセージを表示
            errorMessage.textContent = 'Invalid username or password';
            errorMessage.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    });
});
