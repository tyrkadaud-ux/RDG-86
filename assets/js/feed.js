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

function renderFeed() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div id="feed-container" class="space-y-4"></div>
            <div class="bg-white rounded-2xl shadow-lg p-6 mt-8">
                <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="fas fa-pen-alt mr-2 text-blue-500"></i>Новая запись</h3>
                <textarea id="new-post-text" class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" rows="3" placeholder="Что нового в городе?"></textarea>
                <div class="flex items-center justify-between mt-3">
                    <label class="cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"><i class="fas fa-image mr-1"></i>Фото<input type="file" id="new-post-image" accept="image/*" class="hidden"></label>
                    <button id="post-submit" class="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"><i class="fas fa-paper-plane mr-1"></i>Опубликовать</button>
                </div>
            </div>
        </div>
    `;

    displayPosts();

    document.getElementById('post-submit').addEventListener('click', () => {
        const text = document.getElementById('new-post-text').value.trim();
        if (!text) return;
        const file = document.getElementById('new-post-image').files[0];
        let imageURL = null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageURL = e.target.result;
                addPost(text, imageURL);
            };
            reader.readAsDataURL(file);
        } else {
            addPost(text, null);
        }
    });
}

function addPost(text, imageURL) {
    const newPost = {
        id: Date.now().toString(),
        text: text,
        imageURL: imageURL,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorPhotoURL: currentUser.photoURL,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: []
    };
    posts.unshift(newPost);
    savePosts();
    document.getElementById('new-post-text').value = '';
    document.getElementById('new-post-image').value = '';
    displayPosts();
}

function displayPosts() {
    const container = document.getElementById('feed-container');
    container.innerHTML = '';
    posts.forEach(post => {
        const postEl = createPostElement(post);
        container.appendChild(postEl);
    });
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-2xl shadow-md p-5 transition hover:shadow-lg';
    div.innerHTML = `
        <div class="flex items-start space-x-3">
            <img src="${post.authorPhotoURL}" class="rounded-full w-10 h-10 object-cover">
            <div class="flex-1">
                <div class="flex items-center justify-between">
                    <h3 class="font-semibold text-gray-800">${post.authorName}</h3>
                    <span class="text-xs text-gray-500">${new Date(post.timestamp).toLocaleString()}</span>
                </div>
                <p class="text-gray-700 mt-1">${post.text}</p>
                ${post.imageURL ? `<img src="${post.imageURL}" class="mt-3 rounded-xl max-h-96 w-full object-cover">` : ''}
                <div class="flex items-center space-x-6 mt-3 text-gray-500">
                    <button class="like-btn flex items-center space-x-1 hover:text-red-500 transition" data-id="${post.id}">
                        <i class="fas fa-heart ${post.likes.includes(currentUser.id) ? 'text-red-500' : ''}"></i>
                        <span>${post.likes.length}</span>
                    </button>
                    <button class="comment-btn flex items-center space-x-1 hover:text-blue-500 transition" data-id="${post.id}">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments.length}</span>
                    </button>
                </div>
                <div class="comments-section hidden mt-3 border-t pt-2" id="comments-${post.id}"></div>
            </div>
        </div>
    `;
    div.querySelector('.like-btn').addEventListener('click', () => {
        const idx = posts.findIndex(p => p.id === post.id);
        if (idx !== -1) {
            if (posts[idx].likes.includes(currentUser.id)) {
                posts[idx].likes = posts[idx].likes.filter(id => id !== currentUser.id);
            } else {
                posts[idx].likes.push(currentUser.id);
            }
            savePosts();
            displayPosts();
        }
    });
    div.querySelector('.comment-btn').addEventListener('click', () => {
        const commentsDiv = div.querySelector(`.comments-section`);
        commentsDiv.classList.toggle('hidden');
        if (!commentsDiv.innerHTML) {
            loadComments(post.id, commentsDiv);
        }
    });
    return div;
}

function loadComments(postId, container) {
    const post = posts.find(p => p.id === postId);
    container.innerHTML = '';
    post.comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'flex items-start space-x-2 mt-2';
        commentDiv.innerHTML = `
            <img src="${comment.authorPhotoURL}" class="rounded-full w-6 h-6 object-cover">
            <div class="bg-gray-100 rounded-xl p-2 flex-1">
                <span class="font-semibold text-sm">${comment.authorName}</span>
                <p class="text-sm">${comment.text}</p>
            </div>
        `;
        container.appendChild(commentDiv);
    });
    const formDiv = document.createElement('div');
    formDiv.className = 'flex mt-2';
    formDiv.innerHTML = `
        <input type="text" class="flex-1 border rounded-l-xl p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" placeholder="Написать комментарий...">
        <button class="bg-blue-500 text-white px-3 rounded-r-xl hover:bg-blue-600 transition"></button>
    `;
    const input = formDiv.querySelector('input');
    const btn = formDiv.querySelector('button');
    btn.addEventListener('click', () => {
        if (input.value.trim()) {
            const newComment = {
                id: Date.now().toString(),
                text: input.value,
                authorId: currentUser.id,
                authorName: currentUser.name,
                authorPhotoURL: currentUser.photoURL,
                timestamp: new Date().toISOString()
            };
            const idx = posts.findIndex(p => p.id === postId);
            posts[idx].comments.push(newComment);
            savePosts();
            loadComments(postId, container);
            input.value = '';
        }
    });
    container.appendChild(formDiv);
}

if (!requireAuth()) { /* редирект */ }
loadHeader('feed');
renderFeed();
initBots();
