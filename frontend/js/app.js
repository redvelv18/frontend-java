/**
 * Galvenā aplikācijas loģika
 * DOM manipulācijas un notikumu apstrādātāji
 */

const api = new BlogAPI();

// ============================================
// Inicializācija
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initNavbar();
    checkAuth();
});

// ============================================
// NAVIGĀCIJAS JOSLAS LOĢIKA
// ============================================

function initNavbar() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Hamburger poga (mobilām ierīcēm)
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Navigācijas saites - smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;

            // Aktīvās saites atjaunināšana
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Smooth scroll uz sadaļu
            if (section === 'posts') {
                document.getElementById('posts-container').scrollIntoView({ behavior: 'smooth' });
            } else if (section === 'about') {
                document.querySelector('header').scrollIntoView({ behavior: 'smooth' });
            }

            // Aizvērt mobilā izvēlni
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });
}

function initEventListeners() {
    // Navigācijas pogas
    document.getElementById('btn-login').addEventListener('click', () => toggleForm('login'));
    document.getElementById('btn-register').addEventListener('click', () => toggleForm('register'));
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    document.getElementById('btn-fetch-xhr').addEventListener('click', () => loadPostsXHR());
    document.getElementById('btn-fetch-async').addEventListener('click', () => loadPostsFetch());

    // Formas
    document.getElementById('login').addEventListener('submit', handleLogin);
    document.getElementById('register').addEventListener('submit', handleRegister);
    document.getElementById('create-post').addEventListener('submit', handleCreatePost);
    document.getElementById('create-comment').addEventListener('submit', handleCreateComment);
}

// ============================================
// Auth funkcijas
// ============================================

function checkAuth() {
    if (api.token) {
        showLoggedInState();
        loadUser();
    } else {
        showLoggedOutState();
    }
}

function showLoggedInState() {
    document.getElementById('btn-login').classList.add('hidden');
    document.getElementById('btn-register').classList.add('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('create-post-form').classList.remove('hidden');
}

function showLoggedOutState() {
    document.getElementById('btn-login').classList.remove('hidden');
    document.getElementById('btn-register').classList.remove('hidden');
    document.getElementById('btn-logout').classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('create-post-form').classList.add('hidden');
    document.getElementById('comments-section').classList.add('hidden');
}

function toggleForm(type) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (type === 'login') {
        loginForm.classList.toggle('hidden');
        registerForm.classList.add('hidden');
    } else {
        registerForm.classList.toggle('hidden');
        loginForm.classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        // Izmanto Fetch API (Async/Await)
        const result = await api.loginFetch(
            formData.get('email'),
            formData.get('password')
        );

        showNotification('Veiksmīgi ielogojies!');
        showLoggedInState();
        loadUser();
        e.target.reset();
        document.getElementById('login-form').classList.add('hidden');
    } catch (error) {
        showNotification(error.message || 'Login kļūda', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        // Izmanto XHR
        const result = await api.registerXHR(
            formData.get('name'),
            formData.get('email'),
            formData.get('password'),
            formData.get('password_confirmation')
        );

        showNotification('Veiksmīgi reģistrējies!');
        showLoggedInState();
        loadUser();
        e.target.reset();
        document.getElementById('register-form').classList.add('hidden');
    } catch (error) {
        showNotification(error.message || 'Register kļūda', 'error');
    }
}

async function handleLogout() {
    try {
        await api.logoutFetch();
        showNotification('Veiksmīgi izlogojies!');
        showLoggedOutState();
        document.getElementById('posts-list').innerHTML = '';
    } catch (error) {
        showNotification(error.message || 'Logout kļūda', 'error');
    }
}

async function loadUser() {
    try {
        const user = await api.getUserFetch();
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-email').textContent = user.email;
    } catch (error) {
        console.error('Kļūda ielādējot lietotāju:', error);
    }
}

// ============================================
// Posts funkcijas - DIVAS METODES
// ============================================

// METODE 1: XMLHttpRequest
async function loadPostsXHR() {
    try {
        const posts = await api.getPostsXHR();
        renderPosts(posts, 'XHR');
        showNotification('Ieraksti ielādēti ar XMLHttpRequest!');
    } catch (error) {
        showNotification(error.message || 'Kļūda ielādējot ierakstus', 'error');
    }
}

// METODE 2: Fetch API ar Async/Await
async function loadPostsFetch() {
    try {
        const posts = await api.getPostsFetch();
        renderPosts(posts, 'Fetch');
        showNotification('Ieraksti ielādēti ar Fetch API!');
    } catch (error) {
        showNotification(error.message || 'Kļūda ielādējot ierakstus', 'error');
    }
}

function renderPosts(posts, method) {
    const container = document.getElementById('posts-list');
    container.innerHTML = '';

    if (!posts || posts.length === 0) {
        container.innerHTML = '<p>Nav ierakstu.</p>';
        return;
    }

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.dataset.postId = post.id;

        const statusClass = post.post_status_id === 1 ? 'status-public' : 'status-private';
        const statusText = post.post_status_id === 1 ? 'Publisks' : 'Privāts';

        postCard.innerHTML = `
            <h3>${escapeHtml(post.title)}
                <span class="method-badge badge-${method.toLowerCase()}">${method}</span>
            </h3>
            <p>${escapeHtml(post.body)}</p>
            <div class="post-meta">
                <span>Autors: ${escapeHtml(post.user?.name || 'Nezināms')}</span>
                <span class="post-status ${statusClass}">${statusText}</span>
            </div>
            <div class="post-actions">
                <button class="btn btn-info" onclick="viewComments(${post.id})">Komentāri</button>
                ${api.token ? `<button class="btn btn-danger" onclick="deletePost(${post.id})">Dzēst</button>` : ''}
            </div>
        `;

        container.appendChild(postCard);
    });
}

async function handleCreatePost(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        // Izmanto Fetch API
        await api.createPostFetch(
            formData.get('title'),
            formData.get('body'),
            parseInt(formData.get('post_status_id'))
        );

        showNotification('Ieraksts izveidots!');
        e.target.reset();
        loadPostsFetch();
    } catch (error) {
        showNotification(error.message || 'Kļūda izveidojot ierakstu', 'error');
    }
}

async function deletePost(postId) {
    if (!confirm('Vai tiešām vēlies dzēst šo ierakstu?')) return;

    try {
        // Izmanto XHR
        await api.deletePostXHR(postId);
        showNotification('Ieraksts dzēsts!');
        loadPostsXHR();
    } catch (error) {
        showNotification(error.message || 'Kļūda dzēšot ierakstu', 'error');
    }
}

// ============================================
// Comments funkcijas
// ============================================

async function viewComments(postId) {
    const commentsSection = document.getElementById('comments-section');
    commentsSection.classList.remove('hidden');

    try {
        // Izmanto Fetch API
        const comments = await api.getCommentsFetch(postId);
        renderComments(comments);

        if (api.token) {
            document.getElementById('add-comment-form').classList.remove('hidden');
            document.getElementById('add-comment-form').dataset.postId = postId;
        }

        commentsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showNotification(error.message || 'Kļūda ielādējot komentārus', 'error');
    }
}

function renderComments(comments) {
    const container = document.getElementById('comments-list');
    container.innerHTML = '';

    if (!comments || comments.length === 0) {
        container.innerHTML = '<p>Nav komentāru.</p>';
        return;
    }

    comments.forEach(comment => {
        const commentCard = document.createElement('div');
        commentCard.className = 'comment-card';

        commentCard.innerHTML = `
            <p>${escapeHtml(comment.content)}</p>
            <div class="comment-meta">
                <span>Autors: ${escapeHtml(comment.user?.name || 'Nezināms')}</span>
                <span>${new Date(comment.created_at).toLocaleString('lv')}</span>
            </div>
        `;

        container.appendChild(commentCard);
    });
}

async function handleCreateComment(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const postId = e.target.closest('.form-container').dataset.postId;

    try {
        // Izmanto XHR
        await api.createCommentXHR(postId, formData.get('content'));
        showNotification('Komentārs pievienots!');
        e.target.reset();
        viewComments(postId);
    } catch (error) {
        showNotification(error.message || 'Kļūda pievienojot komentāru', 'error');
    }
}

// ============================================
// Helper funkcijas
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Global funkcijas (nepieciešamas onclick)
window.viewComments = viewComments;
window.deletePost = deletePost;
