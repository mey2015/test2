
// ประกาศตัวแปรส่วนกลาง
const videoElement = document.querySelector('.js-video video');
const castButton = document.querySelector('.js-cast');
const castingControls = document.querySelector('.js-casting-controls');
const playButton = document.querySelector('.js-play');
const pauseButton = document.querySelector('.js-pause');
const stopButton = document.querySelector('.js-stop');



// ฟังก์ชันหลักสำหรับเริ่มต้นการทำงานของ Chromecast
let chromecastInitialized = false;

function initChromecast() {
  if (chromecastInitialized) return;
  chromecastInitialized = true;

  if (!window.chrome || !window.chrome.cast) {
    console.warn("Chromecast API not available.");
    return;
  }

  // Store instance
  const castContext = cast.framework.CastContext.getInstance();

  castContext.setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });

  remotePlayer = new cast.framework.RemotePlayer();
  remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);

  castContext.addEventListener(
    cast.framework.CastContextEventType.CAST_STATE_CHANGED,
    (event) => {
      console.log('Cast state changed:', event.castState);
      updateCastButtonState(event.castState);
    }
  );

  remotePlayerController.addEventListener(
    cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
    () => {
      console.log('Remote player connected status:', remotePlayer.isConnected);
      if (remotePlayer.isConnected) {
        videoElement.pause();
        toggleCastingControls(true);
      } else {
        toggleCastingControls(false);
        videoElement.play();
      }
    }
  );

  if (playButton) playButton.addEventListener('click', () => {
    if (remotePlayer.isPaused) remotePlayerController.playOrPause();
  });

  if (pauseButton) pauseButton.addEventListener('click', () => {
    if (!remotePlayer.isPaused) remotePlayerController.playOrPause();
  });

  if (stopButton) stopButton.addEventListener('click', () => {
    remotePlayerController.stop();
  });

  if (castButton) castButton.addEventListener('click', launchCastApp);

  updateCastButtonState(castContext.getCastState());
}

// ฟังก์ชันสำหรับอัปเดตสถานะของปุ่ม Cast
function updateCastButtonState(castState) {
  if (!castButton) return;
  if (castState === cast.framework.CastState.NO_DEVICES_AVAILABLE) {
    castButton.classList.add('hidden');
  } else {
    castButton.classList.remove('hidden');
  }
}

// ฟังก์ชันสำหรับสลับการแสดงผลของส่วนควบคุมการแคสต์
function toggleCastingControls(isCasting) {
  if (!castingControls || !videoElement) return; // Defensive check
  castingControls.setAttribute('aria-hidden', !isCasting);
  videoElement.controls = !isCasting; // Use property assignment for clarity
}

// ฟังก์ชันสำหรับเชื่อมต่อกับ Cast Session
async function connectToSession() {
  castSession = cast.framework.CastContext.getInstance().getCurrentSession();
  if (!castSession) {
    try {
      castSession = await cast.framework.CastContext.getInstance().requestSession();
    } catch (error) {
      console.error("Failed to start Cast session:", error);
      return null;
    }
  }
  return castSession;
}

// ฟังก์ชันสำหรับกำหนดรายละเอียดของวิดีโอ
function setMediaInfo(url, title = "Untitled Video", options = {}) {
  if (typeof url !== "string" || !url.trim()) {
    throw new Error("Media URL must be a non-empty string.");
  }

  // Map file extensions to content types
  const contentTypeMap = {
    ".m3u8": "application/x-mpegURL",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mov": "video/quicktime"
  };

  // Find extension and content type
  const extMatch = url.match(/\.\w+$/);
  const ext = extMatch ? extMatch[0].toLowerCase() : "";
  const contentType = contentTypeMap[ext] || "application/octet-stream";

  const mediaInfo = new chrome.cast.media.MediaInfo(url);
  mediaInfo.contentType = contentType;

  // Metadata setup
  const metadata = new chrome.cast.media.GenericMediaMetadata();
  metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
  metadata.title = title;

  // Optionally add more metadata if provided
  if (options.images && Array.isArray(options.images)) {
    metadata.images = options.images;
  }
  if (options.subtitle) {
    metadata.subtitle = options.subtitle;
  }
  if (options.description) {
    metadata.description = options.description;
  }
  mediaInfo.metadata = metadata;

  return mediaInfo;
}

// ฟังก์ชันสำหรับเริ่มต้นการแคสต์วิดีโอ
function launchCastApp() {
  connectToSession()
    .then((session) => {
      if (!session) {
        throw new Error('Failed to get Cast session.');
      }
      // Robust video source selection
      let currentVideoSource = videoElement.src;
      if (!currentVideoSource) {
        const sourceElem = videoElement.querySelector('source');
        if (sourceElem && sourceElem.src) {
          currentVideoSource = sourceElem.src;
        }
      }

      if (!currentVideoSource) {
        throw new Error('No video source found to cast.');
      }

      const videoTitle = videoElement.title || videoElement.getAttribute('data-title') || "Video";
      const mediaInfo = setMediaInfo(currentVideoSource, videoTitle);
      const loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);
      loadRequest.autoplay = true;

      return session.loadMedia(loadRequest);
    })
    .then(() => {
      console.log('Media loaded successfully on Chromecast.');
      // toggleCastingControls(true); // Call this after successful connection change listener
    })
    .catch((error) => {
      console.error('Error launching Cast app or loading media:', error.message || error);
      // Resume playback only if video is paused and not already playing
      if (videoElement.paused && !videoElement.ended) {
        videoElement.play();
      }
      toggleCastingControls(false);
    });
}

// เมื่อ Cast API โหลดเสร็จแล้ว ให้เริ่มต้นการทำงานของ Chromecast
window.__onGCastApiAvailable = function(isAvailable) {
  if (isAvailable) {
    initChromecast();
  } else {
    console.warn("Chromecast API not available.");
    updateCastButtonState(cast.framework.CastState.NO_DEVICES_AVAILABLE);
  }
};
