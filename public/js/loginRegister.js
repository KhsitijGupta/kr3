// import sendEmail from "./sendMail";
// const sendEmail = require("../../views/sendMail.js")
import { sendEmail } from './sendMail.js';

// const sendEmail = require("./sendMail");

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
const nodemailer = require("nodemailer");

// // Function to generate a random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
}


    const otp = generateOTP(); // Generate an OTP
    const transporter = nodemailer.createTransport({
        secure: true,
        host: "smtp.gmail.com", // Use 'service' for Gmail (simplifies the config)
        auth: {
            user: "songsplaylists2021@gmail.com", // Replace with your Gmail address
            pass: "upqvwipjdnbkeazv",     // Replace with your app password, NOT your Gmail password
        },
    });

    function sendEmail(to) {
        transporter.sendMail({
            from: '"Raushan Gupta" <kg221688@gmail.com>', // Sender's email address
            to: to, // Replace with the receiver's email
            subject: "Registration One-Time-Password (OTP).",
            text: `Your OTP is: ${otp}`, // Plain text OTP
            html: `<p>Your OTP is: <b>${otp}</b></p>`, // HTML formatted OTP
        })
        console.log("Email send!")
    }
    // sendEmail("biharifun6@gmail.com");

let sendMailBtn = document.getElementById("sendMailBtn");
sendMailBtn.addEventListener('click', () => {
    sendEmail("biharifun6@gmail.com");
    
});