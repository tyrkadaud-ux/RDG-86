// Инициализация хранилищ
let posts = JSON.parse(localStorage.getItem('posts') || '[]');
let chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
let freeAds = JSON.parse(localStorage.getItem('freeAds') || '[]');
let commercialAds = JSON.parse(localStorage.getItem('commercialAds') || '[]');

function savePosts() { localStorage.setItem('posts', JSON.stringify(posts)); }
function saveChatMessages() { localStorage.setItem('chatMessages', JSON.stringify(chatMessages)); }
function saveFreeAds() { localStorage.setItem('freeAds', JSON.stringify(freeAds)); }
function saveCommercialAds() { localStorage.setItem('commercialAds', JSON.stringify(commercialAds)); }

// Заполнение тестовыми данными, если пусто
function initTestData() {
    if (posts.length === 0) {
        posts = [
            { id: '1', text: 'Добро пожаловать в МойГород!', authorId: 'system', authorName: 'Администрация', authorPhotoURL: 'https://via.placeholder.com/40', timestamp: new Date().toISOString(), likes: [], comments: [] },
            { id: '2', text: 'Сегодня в парке концерт в 18:00', authorId: 'system', authorName: 'Администрация', authorPhotoURL: 'https://via.placeholder.com/40', timestamp: new Date().toISOString(), likes: [], comments: [] }
        ];
        savePosts();
    }
    if (chatMessages.length === 0) {
        chatMessages = [
            { id: '1', text: 'Привет всем!', userId: 'system', userName: 'Система', timestamp: new Date().toISOString() }
        ];
        saveChatMessages();
    }
    if (freeAds.length === 0) {
        freeAds = [
            { id: '1', title: 'Продам велосипед', description: 'Хороший велосипед, почти новый', contact: '+7 123 456-78-90', authorId: 'system', authorName: 'Администрация', authorPhotoURL: 'https://via.placeholder.com/40', timestamp: new Date().toISOString() }
        ];
        saveFreeAds();
    }
    if (commercialAds.length === 0) {
        commercialAds = [
            { id: '1', title: 'Реклама кафе', description: 'Вкусная еда, уютная атмосфера', contact: '+7 987 654-32-10', authorId: 'system', authorName: 'Администрация', authorPhotoURL: 'https://via.placeholder.com/40', timestamp: new Date().toISOString(), approved: true }
        ];
        saveCommercialAds();
    }
}
initTestData();

// Боты (имитация активности)
function initBots() {
    const botNames = ['Наталия88', 'Сергей_Лесник', 'Анна_Петровна', 'Дмитрий_Авто', 'Елена_Город'];
    setInterval(() => {
        const randomBot = {
            id: 'bot_' + Math.random(),
            name: botNames[Math.floor(Math.random() * botNames.length)],
            photoURL: 'https://randomuser.me/api/portraits/women/' + Math.floor(Math.random()*10) + '.jpg'
        };
        const action = Math.random();
        if (action < 0.3) {
            const texts = ['Отличная погода сегодня!', 'Кто пойдёт на субботник?', 'Соседи, подскажите хорошего сантехника'];
            const newPost = {
                id: Date.now().toString(),
                text: texts[Math.floor(Math.random() * texts.length)],
                authorId: randomBot.id,
                authorName: randomBot.name,
                authorPhotoURL: randomBot.photoURL,
                timestamp: new Date().toISOString(),
                likes: [],
                comments: []
            };
            posts.unshift(newPost);
            savePosts();
            // Обновить ленту, если открыта
            if (window.renderFeed) window.renderFeed();
        } else if (action < 0.6 && posts.length > 0) {
            const randomPost = posts[Math.floor(Math.random() * posts.length)];
            const commentTexts = ['', 'Согласен', 'Интересно', 'Спасибо!'];
            randomPost.comments.push({
                id: Date.now().toString(),
                text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
                authorId: randomBot.id,
                authorName: randomBot.name,
                authorPhotoURL: randomBot.photoURL,
                timestamp: new Date().toISOString()
            });
            savePosts();
            if (window.renderFeed) window.renderFeed();
        } else if (action < 0.8 && posts.length > 0) {
            const randomPost = posts[Math.floor(Math.random() * posts.length)];
            if (!randomPost.likes.includes(randomBot.id)) {
                randomPost.likes.push(randomBot.id);
                savePosts();
                if (window.renderFeed) window.renderFeed();
            }
        } else {
            const chatTexts = ['Привет!', 'Как дела?', 'Кто в городе?', 'Отлично!'];
            const newMsg = {
                id: Date.now().toString(),
                text: chatTexts[Math.floor(Math.random() * chatTexts.length)],
                userId: randomBot.id,
                userName: randomBot.name,
                timestamp: new Date().toISOString()
            };
            chatMessages.push(newMsg);
            saveChatMessages();
            if (window.renderChat) window.renderChat();
        }
    }, 30000);
}
