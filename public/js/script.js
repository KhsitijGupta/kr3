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

// Theme control Dark and Light
let switchButton = document.getElementById('flexSwitchCheckDefault');
let body = document.querySelector('header');
switchButton.addEventListener('click', () => {
    if(switchButton.checked){
        body.style.backgroundColor = "#000";
        body.style.Color = "#fff";
        alert("on")
    } else {
        alert("off")
    }
})


/*Profile box management.*/

// Event listeners for the tabs
document.getElementById('profileTab').addEventListener('click', function() {
    // Show profile and hide settings
    document.getElementById('profile').classList.add('active');
    document.getElementById('profileTab').classList.add('tabActive');
    document.getElementById('settings').classList.remove('active');
    document.getElementById('settingsTab').classList.remove('tabActive');
    document.getElementById('profileUpdate').classList.add('d-none');
});

document.getElementById('settingsTab').addEventListener('click', function() {
    // Show settings and hide profile
    document.getElementById('settings').classList.add('active');
    document.getElementById('settingsTab').classList.add('tabActive');
    document.getElementById('profile').classList.remove('active');
    document.getElementById('profileTab').classList.remove('tabActive');
    document.getElementById('profileUpdate').classList.add('d-none');
});

// Update and Exit buttons
document.getElementById('updateProfile').addEventListener('click', function() {
    document.getElementById('profile').classList.remove('active');
    document.getElementById('profileUpdate').classList.remove('d-none');
});

// document.getElementById('exitButton').addEventListener('click', function() {
//     window.close(); // Close the window (won't work in most modern browsers)
//     alert('User Logout!'); // Fallback alert
// });

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

// // Update profile photo uploading
// let photo = document.getElementById('uploadPhoto');
// let photoDisplay = document.getElementById('photoDisplay');
// let imgTag = document.createElement('img');


// photo.addEventListener('change', () => {
// let file = photo.files[0];  // Get the first selected file
// if (file) {
//     let reader = new FileReader();  // Create a FileReader object
//     reader.readAsDataURL(file);     // Read the file as a Data URL

//     reader.onload = function () {
//         let filename1 = reader.result;   // Get the base64 image data
//         imgTag.setAttribute('src', filename1);  // Set the src of img to base64
//         photoDisplay.innerHTML = '';  // Clear previous image or content
//         photoDisplay.appendChild(imgTag);  // Add the new image
//     };
// }
// });






