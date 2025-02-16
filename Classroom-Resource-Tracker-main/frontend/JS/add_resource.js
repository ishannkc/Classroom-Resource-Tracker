document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const resourceName = form.querySelector('select[name="resourceName"]').value;
        const email = form.querySelector('input[type="text"]').value;
        const quantity = form.querySelector('input[type="number"]').value;

        // Validate input values
        if (!resourceName || !email || !quantity) {
            alert('All fields are required.');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        const resource = {
            resourceName,
            email,
            quantity,
        };

        try {
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.classList.add('loading');
            loadingIndicator.innerText = 'Submitting...';
            document.body.appendChild(loadingIndicator);

            const response = await fetch('http://localhost:3000/api/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resource)
            });

            const result = await response.json();
            alert(result.message);

            if (response.ok) {
                window.location.href = 'avlble_resource.html';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add resource.');
        } finally {
            // Hide loading indicator
            document.body.removeChild(loadingIndicator);
        }
    });
});
