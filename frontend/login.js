const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

//show password function
function togglePassword(id) {
    const input = document.getElementById(id);
    const type = input.type === "password" ? "text" : "password";
    input.type = type;
}

//confirm password validity
function data__signup() {
    const name = document.getElementById('n3').value;
    const email = document.getElementById('n4').value;
    const password = document.getElementById('n5').value;
    const confirmPassword = document.getElementById('n6').value;
    const role = document.querySelector('input[name="role"]:checked + label').textContent;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return false;
    }

    // Save user data to local storagea(database will be used later, code needs to be edited)
    const userData = {
        name,
        email,
        role,
        contact: " =+977 Not Provided" 
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    alert("Sign-up successful!");
    return true;
}

//email validity
function data__signin() {
    const email = document.getElementById('n1').value;

    if (!email.includes('@')) {
        alert("Please enter a valid email address!");
        return false;
    }

    return true;
}
