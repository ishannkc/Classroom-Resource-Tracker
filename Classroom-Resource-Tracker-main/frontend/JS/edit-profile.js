document.addEventListener('DOMContentLoaded', async () => {
    const nameElement = document.getElementById('name');
    const emailElement = document.getElementById('email');
    const contactElement = document.getElementById('contact');
    const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage

    if (!userId) {
        alert('User ID is missing. Please log in again.');
        return;
    }

    try {
        // Fetch user data from the backend
        const response = await fetch('http://localhost:3000/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId // Include user ID in headers
            }
        });

        if (response.ok) {
            const data = await response.json(); // Parse the response JSON

            // Update the profile elements with fetched data
            nameElement.value = data.name || "Unknown User";
            emailElement.value = data.email || "No Email Provided";
            if (data.contact) {
                contactElement.value = data.contact;
            }
        } else {
            // Handle errors returned by the server
            const error = await response.json();
            console.error('Error fetching profile data:', error);
            alert(`Failed to load profile: ${error.message}`);
        }
    } catch (err) {
        // Handle client-side errors
        console.error('Error fetching profile data:', err);
        alert('An error occurred while fetching profile data.');
    }

    // Prevent name and email fields from being edited
    if (nameElement) nameElement.readOnly = true;
    if (emailElement) emailElement.readOnly = true;

    // Attach form submission event listener only if the form exists
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', saveData, { once: true });
    }

async function saveData(event) {
    event.preventDefault();
    const contactElement = document.getElementById('contact');
    const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage

    if (!contactElement || !userId) {
        alert("Form elements missing!");
        return;
    }

    const contact = contactElement.value.trim();

    if (!contact) {
        alert("Contact number is required!");
        return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('contact', contact);

    try {
        const response = await fetch('http://localhost:3000/api/profile', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            alert('Contact updated successfully!');
            window.location.href = 'main-page.html';
        } else {
            alert(`Contact update failed: ${result.message}`);
        }
    } catch (error) {
        console.error('Contact Update Error:', error);
        alert('Contact update failed due to a client-side error.');
    }
}
});