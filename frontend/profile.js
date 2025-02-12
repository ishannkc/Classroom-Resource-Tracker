

document.addEventListener('DOMContentLoaded', async () => {
    const profilePic = document.getElementById('profile-pic');
    if (profilePic.style.display === 'none') {
        profilePic.style.display = 'block'; // Ensure the image is always displayed
    }
    // DOM Elements
    const nameElement = document.getElementById('name');
    const emailElement = document.getElementById('email');
    const roleElement = document.getElementById('role');
    const profilePicElement = document.getElementById('profile-pic');
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
            nameElement.textContent = data.name || "Unknown User";
            emailElement.textContent = data.email || "No Email Provided";
            roleElement.textContent = data.role || "No Role Assigned";

            // Update profile picture if provided
            if (data.profilePicUrl) {
                profilePicElement.src = data.profilePicUrl;
                profilePicElement.style.display = 'block'; // Ensure it is visible
            } else {
                profilePicElement.style.display = 'none'; // Hide the profile picture if not provided
            }

            // Update contact information if provided
            if (data.contact) {
                contactElement.textContent = data.contact;
                contactElement.style.display = 'block'; // Ensure it is visible
            } else {
                contactElement.style.display = 'none'; // Hide the contact element if not provided
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
});
