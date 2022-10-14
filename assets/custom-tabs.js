var titles = document.querySelectorAll(".toggle .toggle-title") 
for (i = 0; i < titles.length; i++) {
if (titles[i].classList.contains("active")) {
titles[i]
.closest(".toggle")
.querySelector(".toggle-inner").style.display = "block";
}
titles[i]
.addEventListener("click", function () {
if (this.classList.contains("active")) {
  this.classList.remove("active")
  const toggleInner = this.closest(".toggle").querySelector(".toggle-inner");
  toggleInner.style.transition = "all 2s ease-in-out";
  toggleInner.style.height = "0px";
  toggleInner.style.display = "none";
} else {
  this.classList.add("active")
  const toggleInner = this.closest(".toggle").querySelector(".toggle-inner");
  toggleInner.style.transition = "all 2s ease-in-out";
  toggleInner.style.height = "auto";
  toggleInner.style.display = "block";
}
});
}