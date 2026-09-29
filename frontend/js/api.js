/**
 * API klase - Laravel Blog API
 * DIVAS metodes: XMLHttpRequest un Fetch API (Async/Await)
 */

const API_BASE_URL = 'http://localhost:8000/api';

class BlogAPI {
    constructor() {
        this.token = localStorage.getItem('token') || null;
    }

    // ============================================
    // METODE 1: XMLHttpRequest (XHR)
    // ============================================

    xhrRequest(method, endpoint, data = null) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url = `${API_BASE_URL}${endpoint}`;

            xhr.open(method, url, true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');

            if (this.token) {
                xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
            }

            // Progress bar
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    updateProgressBar(percentComplete);
                }
            });

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    hideSpinner();
                    hideProgressBar();

                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (e) {
                            resolve(xhr.responseText);
                        }
                    } else {
                        try {
                            const error = JSON.parse(xhr.responseText);
                            reject(error);
                        } catch (e) {
                            reject({ message: 'Kļūda pieprasījumā' });
                        }
                    }
                }
            };

            xhr.onerror = () => {
                hideSpinner();
                hideProgressBar();
                reject({ message: 'Tīkla kļūda' });
            };

            showSpinner();
            showProgressBar();

            xhr.send(data ? JSON.stringify(data) : null);
        });
    }

    // ============================================
    // METODE 2: Fetch API ar Async/Await
    // ============================================

    async fetchRequest(method, endpoint, data = null) {
        const url = `${API_BASE_URL}${endpoint}`;

        const options = {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        };

        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        showSpinner();
        showProgressBar();

        try {
            const response = await fetch(url, options);
            hideSpinner();
            hideProgressBar();

            if (!response.ok) {
                const error = await response.json();
                throw error;
            }

            return await response.json();
        } catch (error) {
            hideSpinner();
            hideProgressBar();
            throw error;
        }
    }

    // ============================================
    // Auth metodēs
    // ============================================

    // XHR login
    async loginXHR(email, password) {
        const result = await this.xhrRequest('POST', '/login', { email, password });
        if (result.token) {
            this.token = result.token;
            localStorage.setItem('token', this.token);
        }
        return result;
    }

    // Fetch login
    async loginFetch(email, password) {
        const result = await this.fetchRequest('POST', '/login', { email, password });
        if (result.token) {
            this.token = result.token;
            localStorage.setItem('token', this.token);
        }
        return result;
    }

    // XHR register
    async registerXHR(name, email, password, password_confirmation) {
        const result = await this.xhrRequest('POST', '/register', {
            name, email, password, password_confirmation
        });
        if (result.token) {
            this.token = result.token;
            localStorage.setItem('token', this.token);
        }
        return result;
    }

    // Fetch register
    async registerFetch(name, email, password, password_confirmation) {
        const result = await this.fetchRequest('POST', '/register', {
            name, email, password, password_confirmation
        });
        if (result.token) {
            this.token = result.token;
            localStorage.setItem('token', this.token);
        }
        return result;
    }

    // XHR logout
    async logoutXHR() {
        const result = await this.xhrRequest('POST', '/logout');
        this.token = null;
        localStorage.removeItem('token');
        return result;
    }

    // Fetch logout
    async logoutFetch() {
        const result = await this.fetchRequest('POST', '/logout');
        this.token = null;
        localStorage.removeItem('token');
        return result;
    }

    // ============================================
    // Posts metodēs
    // ============================================

    // XHR - Get all posts
    async getPostsXHR() {
        return await this.xhrRequest('GET', '/posts');
    }

    // Fetch - Get all posts
    async getPostsFetch() {
        return await this.fetchRequest('GET', '/posts');
    }

    // XHR - Get single post
    async getPostXHR(postId) {
        return await this.xhrRequest('GET', `/posts/${postId}`);
    }

    // Fetch - Get single post
    async getPostFetch(postId) {
        return await this.fetchRequest('GET', `/posts/${postId}`);
    }

    // XHR - Create post
    async createPostXHR(title, body, post_status_id) {
        return await this.xhrRequest('POST', '/posts', { title, body, post_status_id });
    }

    // Fetch - Create post
    async createPostFetch(title, body, post_status_id) {
        return await this.fetchRequest('POST', '/posts', { title, body, post_status_id });
    }

    // XHR - Delete post
    async deletePostXHR(postId) {
        return await this.xhrRequest('DELETE', `/posts/${postId}`);
    }

    // Fetch - Delete post
    async deletePostFetch(postId) {
        return await this.fetchRequest('DELETE', `/posts/${postId}`);
    }

    // ============================================
    // Comments metodēs
    // ============================================

    // XHR - Get comments
    async getCommentsXHR(postId) {
        return await this.xhrRequest('GET', `/posts/${postId}/comments`);
    }

    // Fetch - Get comments
    async getCommentsFetch(postId) {
        return await this.fetchRequest('GET', `/posts/${postId}/comments`);
    }

    // XHR - Create comment
    async createCommentXHR(postId, content) {
        return await this.xhrRequest('POST', `/posts/${postId}/comments`, { content });
    }

    // Fetch - Create comment
    async createCommentFetch(postId, content) {
        return await this.fetchRequest('POST', `/posts/${postId}/comments`, { content });
    }

    // ============================================
    // User metode
    // ============================================

    // XHR - Get user
    async getUserXHR() {
        return await this.xhrRequest('GET', '/user');
    }

    // Fetch - Get user
    async getUserFetch() {
        return await this.fetchRequest('GET', '/user');
    }
}

// Helper funkcijas
function showSpinner() {
    document.getElementById('spinner').classList.remove('hidden');
}

function hideSpinner() {
    document.getElementById('spinner').classList.add('hidden');
}

function showProgressBar() {
    document.getElementById('progress-bar').classList.remove('hidden');
    updateProgressBar(0);
}

function hideProgressBar() {
    document.getElementById('progress-bar').classList.add('hidden');
    updateProgressBar(0);
}

function updateProgressBar(percent) {
    document.querySelector('.progress-bar').style.width = `${percent}%`;
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}
