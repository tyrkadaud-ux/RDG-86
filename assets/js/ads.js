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

function renderAds() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="mb-6">
                <input type="text" id="search-ads" placeholder=" Поиск объявлений..." class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
            <div id="ads-container" class="space-y-4"></div>
            <div class="bg-white rounded-2xl shadow-lg p-6 mt-8">
                <h3 class="text-xl font-semibold mb-4"><i class="fas fa-plus-circle mr-2 text-green-500"></i>Добавить объявление</h3>
                <input type="text" id="ad-title" placeholder="Заголовок" class="w-full border rounded-xl p-2 mb-2">
                <textarea id="ad-description" placeholder="Описание" class="w-full border rounded-xl p-2 mb-2" rows="3"></textarea>
                <input type="text" id="ad-contact" placeholder="Контакт (телефон, email)" class="w-full border rounded-xl p-2 mb-2">
                <div class="flex items-center justify-between mt-2">
                    <label class="cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"><i class="fas fa-image mr-1"></i>Фото<input type="file" id="ad-image" accept="image/*" class="hidden"></label>
                    <button id="submit-ad" class="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"><i class="fas fa-paper-plane mr-1"></i>Опубликовать</button>
                </div>
            </div>
        </div>
    `;

    displayAds();

    document.getElementById('search-ads').addEventListener('input', filterAds);
    document.getElementById('submit-ad').addEventListener('click', addAd);
}

function displayAds() {
    const container = document.getElementById('ads-container');
    if (!container) return;
    container.innerHTML = '';
    freeAds.forEach(ad => {
        const adDiv = document.createElement('div');
        adDiv.className = 'bg-white rounded-2xl shadow-md p-5 transition hover:shadow-lg';
        adDiv.innerHTML = `
            <div class="flex items-start space-x-3">
                <img src="${ad.authorPhotoURL || 'https://via.placeholder.com/40'}" class="rounded-full w-10 h-10 object-cover">
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold text-gray-800">${ad.authorName}</h3>
                        <span class="text-xs text-gray-500">${new Date(ad.timestamp).toLocaleString()}</span>
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 mt-1">${ad.title}</h4>
                    <p class="text-gray-700">${ad.description}</p>
                    ${ad.imageURL ? `<img src="${ad.imageURL}" class="mt-3 rounded-xl max-h-64 w-full object-cover">` : ''}
                    <div class="mt-2 text-sm text-gray-500"><i class="fas fa-phone-alt mr-1"></i>${ad.contact}</div>
                </div>
            </div>
        `;
        container.appendChild(adDiv);
    });
}

function filterAds() {
    const searchTerm = document.getElementById('search-ads').value.toLowerCase();
    const container = document.getElementById('ads-container');
    if (!container) return;
    const filtered = freeAds.filter(ad => ad.title.toLowerCase().includes(searchTerm) || ad.description.toLowerCase().includes(searchTerm));
    container.innerHTML = '';
    filtered.forEach(ad => {
        const adDiv = document.createElement('div');
        adDiv.className = 'bg-white rounded-2xl shadow-md p-5 transition hover:shadow-lg';
        adDiv.innerHTML = `
            <div class="flex items-start space-x-3">
                <img src="${ad.authorPhotoURL || 'https://via.placeholder.com/40'}" class="rounded-full w-10 h-10 object-cover">
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold text-gray-800">${ad.authorName}</h3>
                        <span class="text-xs text-gray-500">${new Date(ad.timestamp).toLocaleString()}</span>
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 mt-1">${ad.title}</h4>
                    <p class="text-gray-700">${ad.description}</p>
                    ${ad.imageURL ? `<img src="${ad.imageURL}" class="mt-3 rounded-xl max-h-64 w-full object-cover">` : ''}
                    <div class="mt-2 text-sm text-gray-500"><i class="fas fa-phone-alt mr-1"></i>${ad.contact}</div>
                </div>
            </div>
        `;
        container.appendChild(adDiv);
    });
}

function addAd() {
    const title = document.getElementById('ad-title').value.trim();
    const desc = document.getElementById('ad-description').value.trim();
    const contact = document.getElementById('ad-contact').value.trim();
    const file = document.getElementById('ad-image').files[0];
    if (!title || !desc || !contact) return alert('Заполните все поля');
    let imageURL = null;
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageURL = e.target.result;
            saveAd(title, desc, contact, imageURL);
        };
        reader.readAsDataURL(file);
    } else {
        saveAd(title, desc, contact, null);
    }
}

function saveAd(title, desc, contact, imageURL) {
    const newAd = {
        id: Date.now().toString(),
        title, description: desc, contact, imageURL,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorPhotoURL: currentUser.photoURL,
        timestamp: new Date().toISOString()
    };
    freeAds.push(newAd);
    saveFreeAds();
    document.getElementById('ad-title').value = '';
    document.getElementById('ad-description').value = '';
    document.getElementById('ad-contact').value = '';
    document.getElementById('ad-image').value = '';
    displayAds();
}

if (!requireAuth()) { /* редирект */ }
loadHeader('ads');
renderAds();
