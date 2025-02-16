const scrollRevealOption = {
    distance: "50px",
    origin: "bottom",
    duration: 1000,
};
document.addEventListener('DOMContentLoaded', () => {
    const resourceNameInput = document.getElementById('resourceName');
    const storedResourceName = sessionStorage.getItem('resourceName');

    console.log('Stored Resource Name:', storedResourceName); // Debugging log

    if (storedResourceName) {
        resourceNameInput.value = storedResourceName;
    } else {
        console.error('No resource name found in session storage.');
    }

    const form = document.querySelector('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const resourceName = resourceNameInput.value;
        const quantity = form.querySelector('input[type="number"]').value;
        const date = form.querySelector('input[type="date"]').value;
        const startTime = form.querySelector('input[type="time"]').value;
        const endTime = form.querySelectorAll('input[type="time"]')[1].value;

        const booking = {
            resourceName,
            quantity,
            date,
            startTime,
            endTime
        };

        try {
            const response = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(booking)
            });

            const result = await response.json();
            alert(result.message);

            if (response.ok) {
                sessionStorage.removeItem('resourceName');
                window.location.href = 'booked_resource.html';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to book resource.');
        }
    });
});
