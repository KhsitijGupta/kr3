// header hide and show functionality
window.onscroll = function () {
        scrollFunction();
};

let lastScrollTop = 0;

function scrollFunction() {
    let currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (currentScrollTop > lastScrollTop) {
        // Scroll down - hide the navbar
        document.getElementById("navbar").classList.remove("show-navbar1");
        document.getElementById("navbar").classList.remove("home-show");
        document.getElementById("navbar").classList.add("hide-navbar1");
    }
    else if (currentScrollTop === 0) {
        // Ensure navbar is always visible when at the topmost view (before any scroll)
        document.getElementById("navbar").classList.remove("hide-navbar1");
        document.getElementById("navbar").classList.remove("show-navbar1");
        document.getElementById("navbar").classList.add("home-show");
    }
    else {
        // Scroll up - show the navbar
        document.getElementById("navbar").classList.remove("home-show");
        document.getElementById("navbar").classList.remove("hide-navbar1");
        document.getElementById("navbar").classList.add("show-navbar1");
    }

    lastScrollTop = currentScrollTop;
}

/*Profile box management.*/

// Event listeners for the tabs
document.getElementById('profileTab').addEventListener('click', function() {
    // Show profile and hide settings
    document.getElementById('profile').classList.add('active');
    document.getElementById('settings').classList.remove('active');
});

document.getElementById('settingsTab').addEventListener('click', function() {
    // Show settings and hide profile
    document.getElementById('settings').classList.add('active');
    document.getElementById('profile').classList.remove('active');
});

// Update and Exit buttons
document.getElementById('updateProfile').addEventListener('click', function() {
    alert('Update profile button clicked!');
});

document.getElementById('exitButton').addEventListener('click', function() {
    window.close(); // Close the window (won't work in most modern browsers)
    alert('Exit button clicked!'); // Fallback alert
});

// Profile Toggler controler
let profileToggler = document.getElementById("profileToggler");
let profileBox = document.getElementById("container_profile");

profileToggler.addEventListener('click',() => {
    if(profileBox.style.display == "none") {
        profileBox.style.display = "block";
    }else {
        profileBox.style.display = "none";
    }
});
