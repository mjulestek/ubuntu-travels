"use strict";

const btn = document.getElementById("profileBtn");
const menu = document.getElementById("profileMenu");

btn?.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
});

document.addEventListener("click", () => {
    menu?.classList.remove("open");
});
