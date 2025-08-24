
// ประกาศตัวแปรส่วนกลาง
const videoElement = document.querySelector('.js-video video');
const castButton = document.querySelector('.js-cast');
const castingControls = document.querySelector('.js-casting-controls');
const playButton = document.querySelector('.js-play');
const pauseButton = document.querySelector('.js-pause');
const stopButton = document.querySelector('.js-stop');



// ประกาศตัวแปรสำหรับจัดการสถานะการแคสต์
let castSession = null;
let remotePlayer = null;
let remotePlayerController = null;

// ฟังก์ชันหลักสำหรับเริ่มต้นการทำงานของ Chromecast
function initChromecast() {
  if (!window.chrome || !window.chrome.cast) {
    console.warn("Chromecast API not available.");
    return;
  }

  // ตั้งค่า Cast context
  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });

  // สร้างออบเจกต์สำหรับควบคุมการเล่นวิดีโอบนทีวี
  remotePlayer = new cast.framework.RemotePlayer();
  remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);

  // ฟังการเปลี่ยนแปลงสถานะการแคสต์ (เช่น เชื่อมต่อ, ตัดการเชื่อมต่อ)
  cast.framework.CastContext.getInstance().addEventListener(
    cast.framework.CastContextEventType.CAST_STATE_CHANGED,
    (event) => {
      console.log('Cast state changed:', event.castState);
      updateCastButtonState(event.castState);
    }
  );

  // ฟังการเปลี่ยนแปลงสถานะของ Remote Player
  remotePlayerController.addEventListener(
    cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
    () => {
      console.log('Remote player connected status:', remotePlayer.isConnected);
      if (remotePlayer.isConnected) {
        // เมื่อเชื่อมต่อแล้ว ให้ซ่อนวิดีโอในหน้าเว็บและแสดงส่วนควบคุมการแคสต์
        videoElement.pause();
        toggleCastingControls(true);
      } else {
        // ถ้าตัดการเชื่อมต่อ ให้เล่นวิดีโอในหน้าเว็บต่อและซ่อนส่วนควบคุม
        toggleCastingControls(false);
        videoElement.play();
      }
    }
  );
  
  // เพิ่ม Event Listener ให้กับปุ่มควบคุมการแคสต์
  playButton.addEventListener('click', () => {
    remotePlayerController.playOrPause();
  });
  
  pauseButton.addEventListener('click', () => {
    remotePlayerController.playOrPause();
  });

  stopButton.addEventListener('click', () => {
    remotePlayerController.stop();
  });

  // เพิ่ม Event Listener ให้กับปุ่ม Cast
  castButton.addEventListener('click', launchCastApp);

  // อัปเดตสถานะของปุ่มครั้งแรก
  updateCastButtonState(cast.framework.CastContext.getInstance().getCastState());
}

// ฟังก์ชันสำหรับอัปเดตสถานะของปุ่ม Cast
function updateCastButtonState(castState) {
  if (castState === cast.framework.CastState.NO_DEVICES_AVAILABLE) {
    castButton.style.display = 'none'; // ซ่อนปุ่มเมื่อไม่มีอุปกรณ์
  } else {
    castButton.style.display = 'block'; // แสดงปุ่มเมื่อมีอุปกรณ์
  }
}

// ฟังก์ชันสำหรับสลับการแสดงผลของส่วนควบคุมการแคสต์
function toggleCastingControls(isCasting) {
  castingControls.setAttribute('aria-hidden', !isCasting);
  if (isCasting) {
    videoElement.removeAttribute('controls');
  } else {
    videoElement.setAttribute('controls', '');
  }
}

// ฟังก์ชันสำหรับเชื่อมต่อกับ Cast Session
function connectToSession() {
  castSession = cast.framework.CastContext.getInstance().getCurrentSession();
  if (!castSession) {
    return cast.framework.CastContext.getInstance().requestSession()
      .then((session) => {
        castSession = session;
        return session;
      });
  }
  return Promise.resolve(castSession);
}

// ฟังก์ชันสำหรับกำหนดรายละเอียดของวิดีโอ
function setMediaInfo(url, title) {
  const mediaInfo = new chrome.cast.media.MediaInfo(url);

  // ตรวจสอบนามสกุลไฟล์เพื่อกำหนดประเภทของเนื้อหา (contentType) ที่เหมาะสม
  if (url.endsWith('.m3u8')) {
    mediaInfo.contentType = 'application/x-mpegURL'; // สำหรับ HLS
  } else {
    mediaInfo.contentType = 'video/mp4'; // สำหรับ MP4 และวิดีโอทั่วไป
  }

  const metadata = new chrome.cast.media.GenericMediaMetadata();
  metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
  metadata.title = title || "Untitled Video";
  mediaInfo.metadata = metadata;
  
  return mediaInfo;
}

// ฟังก์ชันสำหรับเริ่มต้นการแคสต์วิดีโอ
function launchCastApp() {
  connectToSession()
    .then((session) => {
      if (!session) {
        console.error('Failed to get Cast session.');
        return;
      }
      
      const currentVideoSource = videoElement.src || videoElement.querySelector('source').src;
      const videoTitle = videoElement.title || "Video";

      if (!currentVideoSource) {
        console.error('No video source found to cast.');
        return;
      }

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
      console.error('Error launching Cast app or loading media:', error);
      // ถ้าแคสต์ไม่สำเร็จ ให้เล่นวิดีโอในหน้าเว็บต่อ
      if (videoElement.paused) {
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
