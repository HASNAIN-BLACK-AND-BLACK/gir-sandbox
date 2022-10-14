/* Video Progress Bar Section */
const player = document.querySelector(".player");
const video = player.querySelector(".viewer");
const progressRange = document.querySelector(".progress-range");
const progressBar = document.querySelector(".progress-bar");
const screen_size = player.querySelector(".screenSize");
const screenSize_icon = player.querySelector("#screenSize_icon");
const mobileButton = document.querySelector("#mobile_video_play_btn");
// update progress bar as the video plays
function updateProgress() {
  progressBar.style.width = `${(video.currentTime / video.duration) * 100}%`;
}
function scrub(event) {
  const scrubTime =
    (event.offsetX / progressRange.offsetWidth) * video.duration;
  video.currentTime = scrubTime;
}
// Click to seek within the video
function setProgress(e) {
  const newTime = e.offsetX / progressRange.offsetWidth;
  progressBar.style.width = `${newTime * 100}%`;
}

// Progress bar controls
let mouseDown = false;
progressRange.addEventListener("click", scrub);
progressRange.addEventListener(
  "mousemove",
  (event) => mouseDown && scrub(event)
);
progressRange.addEventListener("mousedown", () => (mouseDown = true));
progressRange.addEventListener("mouseup", () => (mouseDown = false));

//Full screen mode settings
function changeScreenSize() {
  if (player.mozRequestFullScreen) {
    $(".icon_fullscreen").css("display", "none");
    $(".icon_closeFullscreen").css("display", "block");
    player.mozRequestFullScreen();

    // $(".video-wrap").css("display", "block");

    //change icon
    $(".icon_fullscreen").css("display", "none");
    $(".icon_closeFullscreen").css("display", "block");

    /*control panel once fullscreen*/
    screen_size.addEventListener("click", () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        $(".icon_fullscreen").css("display", "none");
        $(".icon_closeFullscreen").css("display", "block");
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
        $(".icon_fullscreen").css("display", "none");
        $(".icon_closeFullscreen").css("display", "block");
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
        $(".icon_fullscreen").css("display", "none");
        $(".icon_closeFullscreen").css("display", "block");
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
      }
    });
  } else if (player.webkitRequestFullScreen) {
    // $(".video-wrap").css("display", "block");
    $(".icon_fullscreen").css("display", "none");
    $(".icon_closeFullscreen").css("display", "block");
    player.webkitRequestFullScreen();

    screen_size.addEventListener("click", () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        $(".icon_fullscreen").css("display", "block");
        $(".icon_closeFullscreen").css("display", "none");
        if (window.matchMedia("(max-width: 990px)").matches) {
          $(".video-wrap").css("display", "none");
        }
      } else if (document.webkitExitFullscreen) {
        document.webkitCancelFullScreen();
        document.webkitExitFullscreen();
        $(".icon_fullscreen").css("display", "block");
        $(".icon_closeFullscreen").css("display", "none");
        if (window.matchMedia("(max-width: 990px)").matches) {
          $(".video-wrap").css("display", "none");
        }
      }
    });
  }
}

function changeScreenSizeMobile() {
  $(".video-wrap").css("display", "block");
  video.webkitEnterFullscreen();
  video.requestFullscreen();
  video.msRequestFullscreen();
  video.mozRequestFullScreen();
  video.play();
}
screen_size.addEventListener("click", changeScreenSize);

mobileButton.addEventListener("click", changeScreenSizeMobile);

video.addEventListener("timeupdate", updateProgress);
video.addEventListener("canplay", updateProgress);
progressRange.addEventListener("click", setProgress);

