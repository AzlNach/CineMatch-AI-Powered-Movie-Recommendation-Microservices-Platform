export function updateUserInterface(user) {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const username = userMenu.querySelector('.username');

    if (user) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        username.textContent = user.username;
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

export function checkLoginState() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const expiresAt = localStorage.getItem('expiresAt');

    if (token && user && new Date(expiresAt) > new Date()) {
        updateUserInterface(user);
        return true;
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiresAt');
        updateUserInterface(null);
        return false;
    }
}

export async function handleLogout(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/users/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('expiresAt');
            
            updateUserInterface(null);
            window.location.href = 'index.html';
        } else {
            const error = await response.json();
            alert(error.message || 'Logout gagal');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat logout');
    }
}

// Initialize auth state
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
    document.getElementById('logoutButton')?.addEventListener('click', handleLogout);
});