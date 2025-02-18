const scrollRevealOption = {
    distance: "50px",
    origin: "bottom",
    duration: 1000,
};
ScrollReveal().reveal("h1", {
    ...scrollRevealOption,
    origin: "left",
});
ScrollReveal().reveal(".box", {
    ...scrollRevealOption,
    delay: 300,
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

            const currentTime = new Date(); // Local current time
            console.log('Current Time:', currentTime); // Debugging log

            bookings.forEach(booking => {
                console.log('Booking Data:', booking);

                // Use the date directly from the response
                const datePart = booking.date.split('T')[0];
                console.log('Extracted Date Part:', datePart); // Debugging log

                // Combine the date part with the end time string
                const endTimeString = `${datePart}T${booking.endTime}`;
                console.log('Combined Date and Time String:', endTimeString); // Debugging log

                const endTime = new Date(endTimeString);
                console.log('Parsed Booking End Time:', endTime); // Debugging log

                if (isNaN(endTime.getTime())) {
                    console.error('Invalid endTime:', booking.endTime);
                }

                if (currentTime < endTime) {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${booking.resourceName}</td>
                        <td>${booking.quantity}</td>
                        <td>${datePart}</td>
                        <td>${booking.startTime}</td>
                        <td>${booking.endTime}</td>
                    `;

                    tableBody.appendChild(row);
                } else {
                    console.log(`Booking for ${booking.resourceName} is past its end time and won't be displayed.`);
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


