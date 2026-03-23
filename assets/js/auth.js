// Хранилище пользователей
let users = JSON.parse(localStorage.getItem('users') || '[]');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveCurrentUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        saveCurrentUser();
        window.location.href = 'feed.html';
    } else {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = 'Неверный email или пароль';
        errorDiv.classList.remove('hidden');
        setTimeout(() => errorDiv.classList.add('hidden'), 3000);
    }
}

function register() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!name || !email || !password) {
        alert('Заполните все поля');
        return;
    }
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password,
        photoURL: 'https://via.placeholder.com/100',
        role: email === 'admin@example.com' ? 'admin' : 'user',
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers();
    currentUser = newUser;
    saveCurrentUser();
    window.location.href = 'feed.html';
}

function logout() {
    currentUser = null;
    saveCurrentUser();
    window.location.href = 'index.html';
}

function requireAuth() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'feed.html';
        return false;
    }
    return true;
}

function getCurrentUser() {
    return currentUser;
}
