document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, confirmPassword })
    })
    .then(response => {
        if (response.status === 201) {
            alert('User registered successfully');
            window.location.href = 'login.html'; // 登録成功後にログインページにリダイレクト
        } else {
            return response.json().then(data => { throw new Error(data.error) });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration failed: ' + error.message);
    });
});
