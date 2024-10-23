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
