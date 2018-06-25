let $preloader = document.getElementById("preloader");

function openPreloader(){
    $preloader.classList.add("visible");
}
function closePreloader(){
    $preloader.classList.remove("visible");
}

export {
    openPreloader,
    closePreloader
}