var videoDomain = "https://hugh.cdn.rumble.cloud/";

function playVideo(elementId, fileName) {
    var videoElement = document.getElementById(elementId);
    if (videoElement) {
        videoElement.src = videoDomain + fileName;
    } else {
        console.error("ไม่พบแท็ก video ที่มี ID: " + elementId);
    }
}
