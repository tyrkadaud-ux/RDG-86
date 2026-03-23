import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, getDoc, setDoc, limit, getDocs, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { loadHeader } from './header.js';

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadHeader('feed');
        await ensureUserProfile(user);
        renderFeed();
        initBots();
    } else {
        window.location.href = '/login.html';
    }
});

async function ensureUserProfile(user) {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || 'https://via.placeholder.com/100',
            role: 'user',
            createdAt: serverTimestamp()
        });
    }
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

    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        const container = document.getElementById('feed-container');
        if (!container) return;
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const post = doc.data();
            const postEl = createPostElement(doc.id, post);
            container.appendChild(postEl);
        });
    });

    document.getElementById('post-submit').addEventListener('click', async () => {
        const text = document.getElementById('new-post-text').value.trim();
        if (!text) return;
        const file = document.getElementById('new-post-image').files[0];
        let imageURL = null;
        if (file) {
            const storageRef = ref(storage, `post_images/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            imageURL = await getDownloadURL(storageRef);
        }
        await addDoc(collection(db, 'posts'), {
            text,
            imageURL,
            authorId: currentUser.uid,
            authorName: currentUser.displayName || currentUser.email,
            authorPhotoURL: currentUser.photoURL || 'https://via.placeholder.com/40',
            timestamp: serverTimestamp(),
            likes: [],
            comments: []
        });
        document.getElementById('new-post-text').value = '';
        document.getElementById('new-post-image').value = '';
    });
}

function createPostElement(id, post) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-2xl shadow-md p-5 transition hover:shadow-lg';
    div.innerHTML = `
        <div class="flex items-start space-x-3">
            <img src="${post.authorPhotoURL}" class="rounded-full w-10 h-10 object-cover">
            <div class="flex-1">
                <div class="flex items-center justify-between">
                    <h3 class="font-semibold text-gray-800">${post.authorName}</h3>
                    <span class="text-xs text-gray-500">${post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : 'только что'}</span>
                </div>
                <p class="text-gray-700 mt-1">${post.text}</p>
                ${post.imageURL ? `<img src="${post.imageURL}" class="mt-3 rounded-xl max-h-96 w-full object-cover">` : ''}
                <div class="flex items-center space-x-6 mt-3 text-gray-500">
                    <button class="like-btn flex items-center space-x-1 hover:text-red-500 transition" data-id="${id}">
                        <i class="fas fa-heart ${post.likes?.includes(currentUser.uid) ? 'text-red-500' : ''}"></i>
                        <span>${post.likes?.length || 0}</span>
                    </button>
                    <button class="comment-btn flex items-center space-x-1 hover:text-blue-500 transition" data-id="${id}">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments?.length || 0}</span>
                    </button>
                </div>
                <div class="comments-section hidden mt-3 border-t pt-2" id="comments-${id}"></div>
            </div>
        </div>
    `;
    div.querySelector('.like-btn').addEventListener('click', async () => {
        const postRef = doc(db, 'posts', id);
        const userLiked = post.likes?.includes(currentUser.uid);
        if (userLiked) {
            await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
        } else {
            await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
        }
    });
    div.querySelector('.comment-btn').addEventListener('click', () => {
        const commentsDiv = div.querySelector(`.comments-section`);
        commentsDiv.classList.toggle('hidden');
        if (!commentsDiv.innerHTML) {
            loadComments(id, commentsDiv);
        }
    });
    return div;
}

async function loadComments(postId, container) {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'asc'));
    onSnapshot(q, (snapshot) => {
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const comment = doc.data();
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
        btn.addEventListener('click', async () => {
            if (input.value.trim()) {
                await addDoc(collection(db, 'posts', postId, 'comments'), {
                    text: input.value,
                    authorId: currentUser.uid,
                    authorName: currentUser.displayName || currentUser.email,
                    authorPhotoURL: currentUser.photoURL || 'https://via.placeholder.com/30',
                    timestamp: serverTimestamp()
                });
                input.value = '';
            }
        });
        container.appendChild(formDiv);
    });
}

async function initBots() {
    const botsRef = collection(db, 'bots');
    const botsSnapshot = await getDocs(botsRef);
    if (botsSnapshot.empty) {
        const botNames = [
            'Наталия88', 'Сергей_Лесник', 'Анна_Петровна', 'Дмитрий_Авто', 
            'Елена_Город', 'Алексей_К', 'Мария_Иванова', 'Игорь_Мастер',
            'Ольга_Смирнова', 'Владимир_Т'
        ];
        for (let i = 0; i < 10; i++) {
            await addDoc(botsRef, {
                uid: `bot_${i}`,
                displayName: botNames[i],
                photoURL: `https://randomuser.me/api/portraits/women/${i}.jpg`,
                role: 'bot',
                active: true,
                interval: 30
            });
        }
    }
    setInterval(async () => {
        const botsSnapshot = await getDocs(query(botsRef, where('active', '==', true)));
        if (botsSnapshot.empty) return;
        const botDocs = botsSnapshot.docs;
        const randomBot = botDocs[Math.floor(Math.random() * botDocs.length)].data();
        const action = Math.random();
        if (action < 0.3) {
            const texts = [
                'Сегодня замечательная погода в городе!',
                'Кто был на новом фестивале?',
                'Ребята, подскажите хороший сервис?',
                'Ура, наконец-то отремонтировали парк!',
                'Привет всем! Как ваши дела?'
            ];
            const text = texts[Math.floor(Math.random() * texts.length)];
            await addDoc(collection(db, 'posts'), {
                text,
                authorId: randomBot.uid,
                authorName: randomBot.displayName,
                authorPhotoURL: randomBot.photoURL,
                timestamp: serverTimestamp(),
                likes: [],
                comments: []
            });
        } else if (action < 0.6) {
            const postsRef = collection(db, 'posts');
            const postsSnapshot = await getDocs(query(postsRef, orderBy('timestamp', 'desc'), limit(5)));
            if (!postsSnapshot.empty) {
                const postDoc = postsSnapshot.docs[Math.floor(Math.random() * postsSnapshot.docs.length)];
                const commentTexts = ['Класс!', 'Согласен', 'Интересно', 'Спасибо за инфо', ''];
                const text = commentTexts[Math.floor(Math.random() * commentTexts.length)];
                await addDoc(collection(db, 'posts', postDoc.id, 'comments'), {
                    text,
                    authorId: randomBot.uid,
                    authorName: randomBot.displayName,
                    authorPhotoURL: randomBot.photoURL,
                    timestamp: serverTimestamp()
                });
            }
        } else if (action < 0.8) {
            const postsRef = collection(db, 'posts');
            const postsSnapshot = await getDocs(query(postsRef, orderBy('timestamp', 'desc'), limit(10)));
            if (!postsSnapshot.empty) {
                const postDoc = postsSnapshot.docs[Math.floor(Math.random() * postsSnapshot.docs.length)];
                const postRef = doc(db, 'posts', postDoc.id);
                await updateDoc(postRef, { likes: arrayUnion(randomBot.uid) });
            }
        } else {
            const chatTexts = ['Привет всем!', 'Как жизнь?', 'Кто в городе?', 'Отличный день!', 'Погода супер'];
            const text = chatTexts[Math.floor(Math.random() * chatTexts.length)];
            await addDoc(collection(db, 'chat_messages'), {
                text,
                userId: randomBot.uid,
                userName: randomBot.displayName,
                timestamp: serverTimestamp()
            });
        }
    }, 30000);
}
