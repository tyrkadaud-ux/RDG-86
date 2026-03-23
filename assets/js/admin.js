let currentUser = null;

function loadHeader(activePage) {
    currentUser = getCurrentUser();
    const headerHtml = `
        <header class="bg-white shadow-lg sticky top-0 z-50">
            <div class="container mx-auto px-4 py-3 flex justify-between items-center flex-wrap">
                <div class="text-2xl font-bold text-blue-600 flex items-center">
                    <i class="fas fa-city mr-2"></i>
                    <span>МойГород</span>
                </div>
                <nav class="space-x-4 mt-2 sm:mt-0">
                    <a href="feed.html" class="${activePage === 'feed' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-home mr-1"></i>Лента</a>
                    <a href="chat.html" class="${activePage === 'chat' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-comments mr-1"></i>Чат</a>
                    <a href="ads.html" class="${activePage === 'ads' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-tags mr-1"></i>Объявления</a>
                    <a href="commercial.html" class="${activePage === 'commercial' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-chart-line mr-1"></i>Бизнес</a>
                    <a href="profile.html" class="${activePage === 'profile' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-user mr-1"></i>Профиль</a>
                    ${currentUser && currentUser.role === 'admin' ? `<a href="admin.html" class="${activePage === 'admin' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-shield-alt mr-1"></i>Админ</a>` : ''}
                </nav>
                <div class="flex items-center space-x-3 mt-2 sm:mt-0">
                    <span class="text-sm text-gray-600">${currentUser ? (currentUser.name || currentUser.email) : ''}</span>
                    <button onclick="logout()" class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm"><i class="fas fa-sign-out-alt mr-1"></i>Выйти</button>
                </div>
            </div>
        </header>
        <main id="main-content"></main>
    `;
    document.getElementById('app').innerHTML = headerHtml;
}

function renderAdmin() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold mb-6">Админ-панель</h1>
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h2 class="text-xl font-semibold mb-3"><i class="fas fa-users mr-2"></i>Пользователи</h2>
                    <div id="users-list" class="space-y-2"></div>
                </div>
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h2 class="text-xl font-semibold mb-3"><i class="fas fa-newspaper mr-2"></i>Посты</h2>
                    <div id="posts-list" class="space-y-2"></div>
                </div>
            </div>
            <div class="mt-6 bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-xl font-semibold mb-3"><i class="fas fa-chart-line mr-2"></i>Платные объявления (на модерации)</h2>
                <div id="commercial-pending" class="space-y-2"></div>
            </div>
        </div>
    `;
    displayUsers();
    displayPosts();
    displayPendingCommercial();
}

function displayUsers() {
    const container = document.getElementById('users-list');
    container.innerHTML = '';
    users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 border-b';
        div.innerHTML = `
            <div>
                <strong>${user.name}</strong><br>
                <span class="text-sm text-gray-500">${user.email}</span>
            </div>
            <button onclick="deleteUser('${user.id}')" class="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">Удалить</button>
        `;
        container.appendChild(div);
    });
}

function displayPosts() {
    const container = document.getElementById('posts-list');
    container.innerHTML = '';
    posts.slice(0, 20).forEach(post => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 border-b';
        div.innerHTML = `
            <div class="flex-1">
                <strong>${post.authorName}</strong>: ${post.text.substring(0, 100)}${post.text.length > 100 ? '...' : ''}
            </div>
            <button onclick="deletePost('${post.id}')" class="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">Удалить</button>
        `;
        container.appendChild(div);
    });
}

function displayPendingCommercial() {
    const container = document.getElementById('commercial-pending');
    container.innerHTML = '';
    const pending = commercialAds.filter(ad => !ad.approved);
    pending.forEach(ad => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 border-b';
        div.innerHTML = `
            <div>
                <strong>${ad.title}</strong> от ${ad.authorName}<br>
                <span class="text-sm text-gray-500">${ad.description.substring(0, 100)}</span>
            </div>
            <button onclick="approveCommercial('${ad.id}')" class="bg-green-500 text-white px-3 py-1 rounded-lg text-sm">Одобрить</button>
        `;
        container.appendChild(div);
    });
}

window.deleteUser = (userId) => {
    if (userId === currentUser.id) {
        alert('Нельзя удалить самого себя');
        return;
    }
    users = users.filter(u => u.id !== userId);
    saveUsers();
    displayUsers();
};

window.deletePost = (postId) => {
    posts = posts.filter(p => p.id !== postId);
    savePosts();
    displayPosts();
};

window.approveCommercial = (adId) => {
    const adIndex = commercialAds.findIndex(ad => ad.id === adId);
    if (adIndex !== -1) {
        commercialAds[adIndex].approved = true;
        saveCommercialAds();
        displayPendingCommercial();
        alert('Объявление одобрено');
    }
};

if (!requireAdmin()) { /* редирект */ }
loadHeader('admin');
renderAdmin();
