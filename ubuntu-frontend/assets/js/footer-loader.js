"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    const mount = document.getElementById("footerMount");
    if (!mount) return;

    const res = await fetch("./partials/footer.html");
    mount.innerHTML = await res.text();
});
