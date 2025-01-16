function saveData() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const contact = document.getElementById('contact').value;

    const profilePic = document.getElementById('profile-pic').src;

    localStorage.setItem('name', name);
    localStorage.setItem('email', email);
    localStorage.setItem('contact', contact);
    localStorage.setItem('profilePic', profilePic);

    return true;
}

function previewImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function() {
        const image = document.getElementById('profile-pic');
        image.src = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}

window.onload = function() {
    if (localStorage.getItem('name')) {
        document.getElementById('name').value = localStorage.getItem('name');
    }
    if (localStorage.getItem('email')) {
        document.getElementById('email').value = localStorage.getItem('email');
    }
    if (localStorage.getItem('contact')) {
        document.getElementById('contact').value = localStorage.getItem('contact');
    }
    if (localStorage.getItem('profilePic')) {
        document.getElementById('profile-pic').src = localStorage.getItem('profilePic');
    }
};

function togglePasswordFields() {
    const passwordFields = document.getElementById('password-fields');
    passwordFields.style.display = passwordFields.style.display === 'none' || passwordFields.style.display === '' ? 'flex' : 'none';
}

function savePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword === confirmPassword) {
        alert('Password changed successfully');
        // Logic to update password in your storage/database
        return true;
    } else {
        alert('New passwords do not match');
        return false;
    }
}
