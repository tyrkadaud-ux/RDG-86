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

function renderProfile() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
                <div class="text-center">
                    <img src="${currentUser.photoURL}" class="rounded-full w-32 h-32 mx-auto mb-4 object-cover border-4 border-blue-200">
                    <h2 class="text-2xl font-bold text-gray-800">${currentUser.name}</h2>
                    <p class="text-gray-500">${currentUser.email}</p>
                </div>
                <div class="mt-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Имя</label>
                        <input type="text" id="profile-name" value="${currentUser.name}" class="mt-1 w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Фото (URL)</label>
                        <input type="text" id="profile-photo" value="${currentUser.photoURL}" class="mt-1 w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    </div>
                    <button id="save-profile" class="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"><i class="fas fa-save mr-1"></i>Сохранить</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('save-profile').addEventListener('click', () => {
        const newName = document.getElementById('profile-name').value;
        const newPhoto = document.getElementById('profile-photo').value;
        currentUser.name = newName;
        currentUser.photoURL = newPhoto;
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            saveUsers();
            saveCurrentUser();
        }
        alert('Профиль обновлён');
        renderProfile(); // перезагрузить
    });
}

if (!requireAuth()) { /* редирект */ }
loadHeader('profile');
renderProfile();
