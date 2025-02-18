
//menu toggle button, appears when clicked
const menuBtn  = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) =>{
    navLinks.classList.toggle("open");

    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line" )
});
//menu disappears when clicked in any of the given lists
navLinks.addEventListener("click", (e) => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", ri-menu-line);
});
//scroll reveal transition
const scrollRevealOption = {
    distance: "50px",
    origin: "bottom",
    duration: 1000,
};
ScrollReveal().reveal(".header__content h1", {
    ...scrollRevealOption,
    origin: "top",
});
ScrollReveal().reveal(".view", {
    ...scrollRevealOption,
    delay: 300,
});
ScrollReveal().reveal(".book", {
    ...scrollRevealOption,
    delay:500,
});
ScrollReveal().reveal(".add", {
    ...scrollRevealOption,
    delay:700,
});


document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role'); // Retrieve role from localStorage

    // DOM Elements
    const bookResourceSection = document.querySelector('.view');
    const bookedResourceSection = document.querySelector('.book');
    const addResourceSection = document.querySelector('.add');

    // Role-based access control
    if (role === 'Student') {
        bookResourceSection.style.display = 'none';
        addResourceSection.style.display = 'none';
    } else if (role === 'CR') {
        addResourceSection.style.display = 'none';
    }

    // Ensure default profile picture is displayed
    const profilePic = document.getElementById('profile-pic');
    if (profilePic.style.display === 'none') {
        profilePic.style.display = 'block'; // Ensure the image is always displayed
    }
});


