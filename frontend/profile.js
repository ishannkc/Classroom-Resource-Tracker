window.onload = function() {
    const name = localStorage.getItem('name') || 'John Doe';
    const email = localStorage.getItem('email') || 'john.doe@example.com';
    const contact = localStorage.getItem('contact') || '+1234567890';

    document.getElementById('name').innerText = name;
    document.getElementById('email').innerText = email;
    document.getElementById('contact').innerText = contact;
};
