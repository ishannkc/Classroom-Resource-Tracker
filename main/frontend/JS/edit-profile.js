document.addEventListener('DOMContentLoaded', async () => { //ensures script runs only after page has fully loaded
    const nameElement = document.getElementById('name');
    const emailElement = document.getElementById('email');
    const contactElement = document.getElementById('contact');
    const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage

    if (!userId) {//if user id not found, prompts message
        alert('User ID is missing. Please log in again.');
        return;
    }

    try {
        // fetching profile data using 'GET' method
        const response = await fetch('http://localhost:3000/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId // Include user ID in headers
            }
        });
        //if request successful, converts response to json
        if (response.ok) {
            const data = await response.json(); 

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

    // adding event listener to form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', saveData, { once: true });//ensures function only runs once
    }
//saving contact data
async function saveData(event) {
    event.preventDefault();
    const contactElement = document.getElementById('contact');
    const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage
    //makes sure fields aren'ts empty
    if (!contactElement || !userId) {
        alert("Form elements missing!");
        return;
    }

    const contact = contactElement.value.trim();

    if (!contact) {
        alert("Contact number is required!");
        return;
    }
    //creates formdata to append userid and contact
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('contact', contact);

    try { //sending data to api
        const response = await fetch('http://localhost:3000/api/profile', {
            method: 'POST',
            body: formData,
        });
        //converting response to json
        const result = await response.json();
        //if success redirect to main page
        if (response.ok) {
            alert('Contact updated successfully!');
            window.location.href = 'main-page.html';
        } else { //if not prompt message
            alert(`Contact update failed: ${result.message}`);
        }
    } catch (error) { //error handling
        console.error('Contact Update Error:', error);
        alert('Contact update failed due to a client-side error.');
    }
}
});