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
    document.getElementById('profileTab').classList.add('tabActive');
    document.getElementById('settings').classList.remove('active');
    document.getElementById('settingsTab').classList.remove('tabActive');
});

document.getElementById('settingsTab').addEventListener('click', function() {
    // Show settings and hide profile
    document.getElementById('settings').classList.add('active');
    document.getElementById('settingsTab').classList.add('tabActive');
    document.getElementById('profile').classList.remove('active');
    document.getElementById('profileTab').classList.remove('tabActive');
});

// Update and Exit buttons
document.getElementById('updateProfile').addEventListener('click', function() {
    alert('Update profile button clicked!');
    document.getElementById('profile').classList.remove('active');
    document.getElementById('profileUpdate').classList.remove('d-none');
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

// Update profile photo uploading
let photo = document.getElementById('uploadPhoto');
let photoDisplay = document.getElementById('photoDisplay');
let imgTag = document.createElement('img');

photo.addEventListener('change', () => {
    let file = photo.files[0];
    if (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            let filename = reader.result;
            imgTag.setAttribute('src', filename);
            photoDisplay.innerHTML = '';  // Clear previous photo if any
            photoDisplay.append(imgTag);
        };
    }
});

// Handle the form submission to send file to the server
// document.getElementById('photoForm').addEventListener('submit', (e) => {
//     e.preventDefault();

//     let formData = new FormData();
//     formData.append('photo', photo.files[0]);

    // fetch('/uploadPhoto/<%=user.ID%>', {
    //     method: 'POST',
    //     body: formData
    // })
    // console.log(formData)
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Photo uploaded successfully:', data);
    // })
    // .catch(error => {
    //     console.error('Error uploading photo:', error);
    // });
// });


