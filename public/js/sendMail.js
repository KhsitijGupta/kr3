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

    module.exports = sendEmail;






