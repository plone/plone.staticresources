document.addEventListener("DOMContentLoaded", function (event) {
  let all = document.querySelectorAll(".zoomable");
  if (all.length > 0) {
    for (let i of all) {
      i.addEventListener("click", (e) => {
        if (
          document.fullscreenElement != null ||
          document.webkitFullscreenElement != null
        ) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else {
            document.webkitCancelFullScreen();
          }
        } else {
          if (i.requestFullscreen) {
            i.requestFullscreen();
          } else {
            i.webkitRequestFullScreen();
          }
        }
      });
    }
  }
});
