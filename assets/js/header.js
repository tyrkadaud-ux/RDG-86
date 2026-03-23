import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export async function loadHeader(activePage) {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = '/login.html';
                return;
            }
            const headerHtml = `
                <header class="bg-white shadow-lg sticky top-0 z-50">
                    <div class="container mx-auto px-4 py-3 flex justify-between items-center flex-wrap">
                        <div class="text-2xl font-bold text-blue-600 flex items-center">
                            <i class="fas fa-city mr-2"></i>
                            <span>МойГород</span>
                        </div>
                        <nav class="space-x-4 mt-2 sm:mt-0">
                            <a href="/feed.html" class="${activePage === 'feed' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-home mr-1"></i>Лента</a>
                            <a href="/chat.html" class="${activePage === 'chat' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-comments mr-1"></i>Чат</a>
                            <a href="/ads.html" class="${activePage === 'ads' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-tags mr-1"></i>Объявления</a>
                            <a href="/commercial.html" class="${activePage === 'commercial' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-chart-line mr-1"></i>Бизнес</a>
                            <a href="/profile.html" class="${activePage === 'profile' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-user mr-1"></i>Профиль</a>
                            ${user.email === 'admin@example.com' ? `<a href="/admin.html" class="${activePage === 'admin' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'} transition"><i class="fas fa-shield-alt mr-1"></i>Админ</a>` : ''}
                        </nav>
                        <div class="flex items-center space-x-3 mt-2 sm:mt-0">
                            <span class="text-sm text-gray-600">${user.displayName || user.email}</span>
                            <button id="logout-btn" class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm"><i class="fas fa-sign-out-alt mr-1"></i>Выйти</button>
                        </div>
                    </div>
                </header>
                <main id="main-content"></main>
            `;
            if (!document.querySelector('header')) {
                document.getElementById('app').innerHTML = headerHtml;
            } else {
                document.querySelector('header').outerHTML = headerHtml;
            }
            document.getElementById('logout-btn')?.addEventListener('click', () => signOut(auth));
            resolve();
        });
    });
}
