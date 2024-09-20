let ctn = document.querySelector(".containerlgn");
let ctn1 = document.querySelector(".container1");
let login = document.querySelector(".login-link");
let register = document.querySelector(".register-link");
// let btn = document.querySelector(".btnLoginPopup");
let close = document.querySelector(".icon-close");
let close2 = document.querySelector(".close2");

// btn.addEventListener("click",()=>{
//     ctn.style="transform:scale(1);"
//     ctn1.style="display:none;"
// })
// close.addEventListener("click",()=>{
//     ctn.style="transform:scale(0);"
// })
// close2.addEventListener("click",()=>{
//     ctn1.style="display:none;"
//     ctn.style="display:none;"
// })
register.addEventListener("click",()=>{
    ctn.style="display:none;"
    ctn1.style="transform:scale(1);"
})
login.addEventListener("click",()=>{
    ctn1.style="display:none;"
    ctn.style="transform:scale(1);"
})
