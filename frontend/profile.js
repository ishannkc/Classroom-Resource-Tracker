
window.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userData) {
        document.getElementById('name').textContent = userData.name;
        document.getElementById('email').textContent = userData.email;
        document.getElementById('role').textContent = `Role: ${userData.role}`;
        document.getElementById('contact').textContent = userData.contact;
    } else {
        alert("No user data found. Please sign up first!");
        window.location.href = 'login.html';
    }
});
