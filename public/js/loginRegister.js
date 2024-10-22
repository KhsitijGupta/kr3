let ctn = document.querySelector(".containerlgn");
let ctn1 = document.querySelector(".container1");
let login = document.querySelector(".login-link");
let register = document.querySelector(".register-link");
// let btn = document.querySelector(".btnLoginPopup");
let close = document.querySelector(".icon-close");
let close2 = document.querySelector(".close2");

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


register.addEventListener("click",()=>{
    ctn.style="display:none;"
    ctn1.style="transform:scale(1);"
})
login.addEventListener("click",()=>{
    ctn1.style="display:none;"
    ctn.style="transform:scale(1);"
})
