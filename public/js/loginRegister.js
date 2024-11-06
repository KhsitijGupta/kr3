// const otps = require("./sendMail")
// import { otp } from "./sendMail";

/*Login box management.*/
let userAccount = document.getElementById('userAccount');
let instituteAccount = document.getElementById('instituteAccount');
let userLoginControl = document.querySelector('.userLoginControl');
let instituteLoginControl = document.querySelector('.instituteLoginControl');

userAccount.addEventListener('click', () => {
    instituteLoginControl.style.display = "none";
    userLoginControl.style.display = "block";
    instituteAccount.classList.remove('tabActive');
    userAccount.classList.add('tabActive');
})
instituteAccount.addEventListener('click', () => {
    userLoginControl.style.display = "none";
    instituteLoginControl.style.display = "block";
    userAccount.classList.remove('tabActive');
    instituteAccount.classList.add('tabActive');
})

// switch login page and register
let loginPage = document.querySelector('.loginPage');
let registerPage = document.querySelector('.registerPage');
let registerLink = document.querySelector('.register-link');
let loginLink = document.querySelector('.login-link');

registerLink.addEventListener("click",()=>{
    loginPage.style="display:none;"
    registerPage.style="transform:scale(1);"
});
loginLink.addEventListener("click",()=>{
    registerPage.style="display:none;"
    loginPage.style="transform:scale(1);"
});

// Sending registration otp
let sendMailForm = document.getElementById("sendMailForm");
let regUserEmail = document.getElementById("regUserEmail");
let otpBox = document.getElementById("otpBox");
let formSubmitBtn = document.querySelector("#regEmail button");
let userOtpInput = document.getElementById("userOtpInput");
let userEmail = document.getElementById("userEmail");
let otpBtn = document.getElementById("otpBtn");
let isFormDisable = document.querySelectorAll(".isFormDisable");

// Function to generate a random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
}
const otp = generateOTP(); // Generated OTP

// function to send otp
function sendEmail(to) {
    (function(){
        emailjs.init({
          publicKey: "9USFHTj0JSE6W61sx",
        });
     })();

     var params = {
        sendername: "KR3",
        to: to,
        subject: "Registration One-Time-Password (OTP)",
        replyto: "kg221688@gmail.com",
        message: `
        Hii Dear,
        Your One-Time-Password (OTP) is ${otp}. Do not share with anyone.`
     };

     var serviceID = "service_3uqfgys";
     var templateID = "template_a3y7md1";

     emailjs.send(serviceID, templateID, params)
     .then( res => {
        alert("Email send successfully !")
     })
     .catch(function (error) {
        alert("Failed to send email: " + error);
    });
}

sendMailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendEmail(regUserEmail.value.replace(/ /g, '').toLowerCase());
    otpBox.style.display = "block";
    formSubmitBtn.innerHTML = '<i class="fas fa-check-circle" style="color: #05aa4f;"></i>';
});

otpBtn.addEventListener('click', () => {
    if(userOtpInput.value == otp){
        sendMailForm.style.display = "none";
        otpBox.style.display = "none";
        userEmail.style.display = "block";
        isFormDisable.forEach((oneByOne) => {
            oneByOne.removeAttribute("disabled");
        });
        userEmail.value = regUserEmail.value.replace(/ /g, '').toLowerCase()
    } else {
        alert("Wrong Otp !");
    }
});