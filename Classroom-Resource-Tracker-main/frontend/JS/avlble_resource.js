const scrollRevealOption = {
    distance: "50px",
    origin: "bottom",
    duration: 1000,
};
ScrollReveal().reveal("h1", {
    ...scrollRevealOption,
    origin: "left",
});
ScrollReveal().reveal(".resource", {
    ...scrollRevealOption,
    delay: 300,
});
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/resources');
        const resources = await response.json();

        const resourceContainer = document.querySelector('.resource');

        resources.forEach(resource => {
            const resourceElement = document.createElement('div');
            resourceElement.classList.add('content');

            resourceElement.innerHTML = `
                <img src="../imgs/${resource.resourceName.toLowerCase()}.png" alt="${resource.resourceName}">
                <h3>${resource.resourceName}</h3>
                <ul>
                    <li>Quantity: ${resource.quantity}</li>
                </ul>
                <a href="book_resource.html" class="button" data-resource="${resource.resourceName}">Book Now</a>
            `;

            resourceContainer.appendChild(resourceElement);
        });

        // Add event listener for Book Now buttons
        resourceContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('button')) {
                const resourceName = e.target.getAttribute('data-resource');
                sessionStorage.setItem('resourceName', resourceName);
            }
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load resources.');
    }
});

