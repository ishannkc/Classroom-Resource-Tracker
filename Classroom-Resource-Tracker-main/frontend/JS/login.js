document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    // Toggle between Sign Up and Sign In views
    registerBtn?.addEventListener('click', () => container?.classList.add("active"));
    loginBtn?.addEventListener('click', () => container?.classList.remove("active"));

    const data__signup = async (event) => {
        event.preventDefault();  // Prevent the form from submitting and reloading the page
    
        const name = document.getElementById('n3').value.trim();
        const email = document.getElementById('n4').value.trim();
        const password = document.getElementById('n5').value;
        const confirmPassword = document.getElementById('n6').value;
    
        // Get the selected role value
        const role = document.querySelector('input[name="role"]:checked')?.value;
    
        // Validate fields
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
    
        if (!name || !email || !password || !role) {
            alert("All fields are required!");
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),  // Send role to backend
            });
    
            const result = await response.json();  // Get the error message or success message from the backend
    
            if (response.ok) {
                alert('Signup successful!');
                // Optionally switch to Sign In view after success
                container.classList.remove("active");
            } else {
                alert(`Signup failed: ${result.message}`);  // Corrected syntax error
            }
        } catch (error) {
            console.error('Signup Error:', error);
            alert('Signup failed due to a client-side error.');
        }
    };
    
    // Handle Login
    const data__signin = async (event) => {
        event.preventDefault();  // Prevent form from submitting
        const email = document.getElementById('n1').value.trim();
        const password = document.getElementById('n2').value;
    
        if (!email || !password) {
            alert("All fields are required!");
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3000/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert('Login successful!');
                localStorage.setItem('userId', result.userId); // Store user ID in localStorage
                localStorage.setItem('role', result.role); // Store user role in localStorage
                window.location.href = 'main-page.html';
            } else {
                alert('Login failed: ' + result.message); // Update to correctly alert the error message
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Login failed due to a client-side error.');
        }
    };
    


    // Attach event listeners to forms
    signupForm.addEventListener("submit", data__signup);
    loginForm.addEventListener("submit", data__signin);
});
