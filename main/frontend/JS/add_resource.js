document.addEventListener('DOMContentLoaded', () => { //eventlistener for page load, ensures page only runs after the html docs has fully loaded
    const form = document.querySelector('form'); //selecting <form> element in the respective html

    form.addEventListener('submit', async (e) => { //event listener to handle form submission
        e.preventDefault(); //prevents reloading when form is being submitted


        //extracting values from the <form>
        const resourceName = form.querySelector('select[name="resourceName"]').value;
        const email = form.querySelector('input[type="text"]').value;
        const quantity = form.querySelector('input[type="number"]').value;

        // Validate input values
        if (!resourceName || !email || !quantity) {
            alert('All fields are required.');
            return;
        }
        //validating email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        //resource object created to be sent to the backend
        const resource = {
            resourceName,
            email,
            quantity,
        };
        //making api request
        try {
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.classList.add('loading');
            loadingIndicator.innerText = 'Submitting...';
            document.body.appendChild(loadingIndicator);
            
            //sends the <form> data to the given address using POST request
            const response = await fetch('http://localhost:3000/api/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resource)
            });
            //waits for response from the server
            const result = await response.json();
            alert(result.message);
            //user is redirected to the given html page if request is successfull
            if (response.ok) {
                window.location.href = 'avlble_resource.html';
            }   
            //if any errors occur
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add resource.');
        } finally {
            // Hide loading indicator
            document.body.removeChild(loadingIndicator);
        }
    });
});
