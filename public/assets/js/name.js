var namei = document.getElementById("iname");
var submit = document.getElementById("enter");

submit.addEventListener("click", function () {
    if (namei.value === "") {
        alert("Whats your name on protato?");
        return;
    }
    localStorage.setItem("name", namei.value);
    window.top.location.href = "/";
});