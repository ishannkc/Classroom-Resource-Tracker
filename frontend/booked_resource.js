const scrollRevealOption = {
    distance: "50px",
    origin: "bottom",
    duration: 1000,
};
ScrollReveal().reveal("h1", {
    ...scrollRevealOption,
    origin: "left",
});


document.addEventListener('DOMContentLoaded', async () => {
    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/bookings');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const bookings = await response.json();

            const tableBody = document.getElementById('booked_resources_table').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Clear the table before appending new data

            bookings.forEach(booking => {
                const endTime = new Date(`${booking.date}T${booking.endTime}`);
                const currentTime = new Date();

                if (currentTime < endTime) {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${booking.resourceName}</td>
                        <td>${booking.quantity}</td>
                        <td>${booking.date}</td>
                        <td>${booking.startTime}</td>
                        <td>${booking.endTime}</td>
                    `;

                    tableBody.appendChild(row);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load booked resources.');
        }
    };

    // Fetch bookings initially
    fetchBookings();

    // Set interval to refresh the bookings table every minute
    setInterval(fetchBookings, 60000);
});
