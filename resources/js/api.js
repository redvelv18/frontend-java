const API_BASE_URL = 'http://localhost:8000/api';

class BlogAPI {
    constructor() {
        this.token = localStorage.getItem('token') || null;
    }

    async fetchRequest(method, endpoint, data = null) {
        const url = `${API_BASE_URL}${endpoint}`;
        const options = {
            method,
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

        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return response.json();
    }

    async login(email, password) {
        const result = await this.fetchRequest('POST', '/login', { email, password });
        if (result.token) {
            this.token = result.token;
            localStorage.setItem('token', this.token);
        }
        return result;
    }

    async register(name, email, password, password_confirmation) {
        const result = await this.fetchRequest('POST', '/register', {
            name, email, password, password_confirmation
        });
        if (result.token) {
            this.token = result.token;
            localStorage.setItem('token', this.token);
        }
        return result;
    }

    async logout() {
        const result = await this.fetchRequest('POST', '/logout');
        this.token = null;
        localStorage.removeItem('token');
        return result;
    }

    async getUser() {
        return this.fetchRequest('GET', '/user');
    }

    async getPosts() {
        return this.fetchRequest('GET', '/posts');
    }

    async getPost(postId) {
        return this.fetchRequest('GET', `/posts/${postId}`);
    }

    async createPost(title, body, post_status_id) {
        return this.fetchRequest('POST', '/posts', { title, body, post_status_id });
    }

    async deletePost(postId) {
        return this.fetchRequest('DELETE', `/posts/${postId}`);
    }

    async getComments(postId) {
        return this.fetchRequest('GET', `/posts/${postId}/comments`);
    }

    async createComment(postId, content) {
        return this.fetchRequest('POST', `/posts/${postId}/comments`, { content });
    }
}

export default BlogAPI;
