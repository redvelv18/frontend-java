import { useState, useEffect, useCallback } from 'react';
import BlogAPI from './api';

const api = new BlogAPI();

function App() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [showCommentForm, setShowCommentForm] = useState(false);

    const showNotif = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const checkAuth = useCallback(async () => {
        if (api.token) {
            try {
                const userData = await api.getUser();
                setUser(userData);
            } catch {
                api.token = null;
                localStorage.removeItem('token');
            }
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await api.getPosts();
            setPosts(data);
        } catch (error) {
            showNotif(error.message || 'Kļūda ielādējot ierakstus', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await api.login(formData.get('email'), formData.get('password'));
            showNotif('Veiksmīgi ielogojies!');
            setShowLogin(false);
            e.target.reset();
            await checkAuth();
        } catch (error) {
            showNotif(error.message || 'Login kļūda', 'error');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await api.register(
                formData.get('name'),
                formData.get('email'),
                formData.get('password'),
                formData.get('password_confirmation')
            );
            showNotif('Veiksmīgi reģistrējies!');
            setShowRegister(false);
            e.target.reset();
            await checkAuth();
        } catch (error) {
            showNotif(error.message || 'Register kļūda', 'error');
        }
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            showNotif('Veiksmīgi izlogojies!');
            setUser(null);
            setPosts([]);
        } catch (error) {
            showNotif(error.message || 'Logout kļūda', 'error');
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await api.createPost(
                formData.get('title'),
                formData.get('body'),
                parseInt(formData.get('post_status_id'))
            );
            showNotif('Ieraksts izveidots!');
            setShowCreatePost(false);
            e.target.reset();
            await loadPosts();
        } catch (error) {
            showNotif(error.message || 'Kļūda izveidojot ierakstu', 'error');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Vai tiešām vēlies dzēst šo ierakstu?')) return;
        try {
            await api.deletePost(postId);
            showNotif('Ieraksts dzēsts!');
            await loadPosts();
        } catch (error) {
            showNotif(error.message || 'Kļūda dzēšot ierakstu', 'error');
        }
    };

    const viewComments = async (post) => {
        setSelectedPost(post);
        try {
            const data = await api.getComments(post.id);
            setComments(data);
            if (api.token) setShowCommentForm(true);
        } catch (error) {
            showNotif(error.message || 'Kļūda ielādējot komentārus', 'error');
        }
    };

    const handleCreateComment = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await api.createComment(selectedPost.id, formData.get('content'));
            showNotif('Komentārs pievienots!');
            e.target.reset();
            const data = await api.getComments(selectedPost.id);
            setComments(data);
        } catch (error) {
            showNotif(error.message || 'Kļūda pievienojot komentāru', 'error');
        }
    };

    return (
        <div>
            <nav className="navbar">
                <div className="nav-container">
                    <a href="#" className="nav-logo" onClick={(e) => e.preventDefault()}>
                        <span className="logo-icon">📝</span>
                        <span className="logo-text">Laravel Blog</span>
                    </a>
                    <div className="nav-menu">
                        <div className="nav-links">
                            <a href="#" className="nav-link active" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Ieraksti</a>
                            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Par mums</a>
                        </div>
                        <div className="nav-actions">
                            {user ? (
                                <>
                                    <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-primary btn-sm" onClick={() => { setShowLogin(!showLogin); setShowRegister(false); }}>Login</button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => { setShowRegister(!showRegister); setShowLogin(false); }}>Register</button>
                                </>
                            )}
                            <div className="nav-divider"></div>
                            <button className="btn btn-info btn-sm" onClick={loadPosts}>Ielādēt</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container">
                <header>
                    <h1>Laravel Blog API</h1>
                    <p className="subtitle">React + Vite + Laravel</p>
                </header>

                {notification && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                {loading && (
                    <div className="spinner">
                        <div className="spinner-circle"></div>
                        <p>Ielādē...</p>
                    </div>
                )}

                {showLogin && (
                    <div className="form-container">
                        <h2>Login</h2>
                        <form onSubmit={handleLogin}>
                            <input type="email" name="email" placeholder="Email" required />
                            <input type="password" name="password" placeholder="Password" required />
                            <button type="submit" className="btn btn-primary">Login</button>
                        </form>
                    </div>
                )}

                {showRegister && (
                    <div className="form-container">
                        <h2>Register</h2>
                        <form onSubmit={handleRegister}>
                            <input type="text" name="name" placeholder="Name" required />
                            <input type="email" name="email" placeholder="Email" required />
                            <input type="password" name="password" placeholder="Password" required />
                            <input type="password" name="password_confirmation" placeholder="Confirm Password" required />
                            <button type="submit" className="btn btn-primary">Register</button>
                        </form>
                    </div>
                )}

                {user && (
                    <div className="user-info">
                        <h3>Paldies, {user.name}!</h3>
                        <p>Email: {user.email}</p>
                    </div>
                )}

                {user && (
                    <div className="form-container">
                        <h2>Izveidot jaunu ierakstu</h2>
                        <form onSubmit={handleCreatePost}>
                            <input type="text" name="title" placeholder="Nosaukums" required />
                            <textarea name="body" placeholder="Saturs" required></textarea>
                            <select name="post_status_id" defaultValue="1">
                                <option value="1">Publisks</option>
                                <option value="2">Privāts</option>
                            </select>
                            <button type="submit" className="btn btn-primary">Izveidot</button>
                        </form>
                    </div>
                )}

                <div className="posts-container">
                    <h2>Ieraksti</h2>
                    {posts.length === 0 && !loading && <p>Nav ierakstu.</p>}
                    {posts.map(post => (
                        <div key={post.id} className="post-card">
                            <h3>{post.title}</h3>
                            <p>{post.body}</p>
                            <div className="post-meta">
                                <span>Autors: {post.user?.name || 'Nezināms'}</span>
                                <span className={`post-status ${post.post_status_id === 1 ? 'status-public' : 'status-private'}`}>
                                    {post.post_status_id === 1 ? 'Publisks' : 'Privāts'}
                                </span>
                            </div>
                            <div className="post-actions">
                                <button className="btn btn-info" onClick={() => viewComments(post)}>Komentāri</button>
                                {user && <button className="btn btn-danger" onClick={() => handleDeletePost(post.id)}>Dzēst</button>}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedPost && (
                    <div className="comments-section">
                        <h2>Komentāri — {selectedPost.title}</h2>
                        {comments.length === 0 && <p>Nav komentāru.</p>}
                        {comments.map(comment => (
                            <div key={comment.id} className="comment-card">
                                <p>{comment.content}</p>
                                <div className="comment-meta">
                                    <span>Autors: {comment.user?.name || 'Nezināms'}</span>
                                    <span>{new Date(comment.created_at).toLocaleString('lv')}</span>
                                </div>
                            </div>
                        ))}
                        {showCommentForm && (
                            <div className="form-container">
                                <form onSubmit={handleCreateComment}>
                                    <textarea name="content" placeholder="Tavs komentārs..." required></textarea>
                                    <button type="submit" className="btn btn-primary">Pievienot komentāru</button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
