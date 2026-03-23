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

function renderChat() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="bg-white rounded-2xl shadow-xl h-[600px] flex flex-col">
                <div class="flex-1 overflow-y-auto p-4 space-y-3" id="chat-messages"></div>
                <div class="p-4 border-t flex space-x-2">
                    <input type="text" id="chat-input" class="flex-1 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Сообщение...">
                    <button id="chat-send" class="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;

    displayMessages();

    document.getElementById('chat-send').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
}

function displayMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    container.innerHTML = '';
    chatMessages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex ${msg.userId === currentUser.id ? 'justify-end' : 'justify-start'}`;
        msgDiv.innerHTML = `
            <div class="max-w-xs ${msg.userId === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} rounded-2xl p-3 shadow">
                <div class="text-xs font-semibold mb-1">${msg.userName}</div>
                <div>${msg.text}</div>
            </div>
        `;
        container.appendChild(msgDiv);
    });
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    const newMsg = {
        id: Date.now().toString(),
        text: text,
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date().toISOString()
    };
    chatMessages.push(newMsg);
    saveChatMessages();
    displayMessages();
    input.value = '';
}

if (!requireAuth()) { /* редирект */ }
loadHeader('chat');
renderChat();
setInterval(() => {
    displayMessages();
}, 1000);
