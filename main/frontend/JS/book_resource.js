
document.addEventListener('DOMContentLoaded', () => {//ensures script only runs after page is fully loaded
    const resourceNameInput = document.getElementById('resourceName');//gets <input> where resource name is entered
    const storedResourceName = sessionStorage.getItem('resourceName');

    console.log('Stored Resource Name:', storedResourceName); // Debugging log
    //auto fills in the selected resource name
    if (storedResourceName) {
        resourceNameInput.value = storedResourceName;
    } else {
        console.error('No resource name found in session storage.');
    }
    //prevents default submission behaviour
    const form = document.querySelector('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        //extracts the user inputs
        const resourceName = resourceNameInput.value;
        const quantity = form.querySelector('input[type="number"]').value;
        const date = form.querySelector('input[type="date"]').value;
        const startTime = form.querySelector('input[type="time"]').value;
        const endTime = form.querySelectorAll('input[type="time"]')[1].value;
        //creating booking object
        const booking = {
            resourceName,
            quantity,
            date,
            startTime,
            endTime
        };
        //sending booking data to api
        try {
            const response = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(booking)
            });
            //converts api response to json
            const result = await response.json();
            alert(result.message);
            //redirects to the given html page if successfull
            if (response.ok) {
                sessionStorage.removeItem('resourceName');
                window.location.href = 'booked_resource.html';
            }
            //error prompts if not successfull
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to book resource.');
        }
    });
});
