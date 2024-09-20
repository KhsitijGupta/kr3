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