var video_start_time = 0;
function setPlayerStartingPosition(player) {
    if (video_start_time > 0) {
        player.on('loadeddata', function (event) {
            var instance = event.detail.plyr;
            if (video_start_time <= instance.duration) {
                instance.off('loadeddata', event);
                instance.currentTime = video_start_time;
            }
        });
    }
}   

function IsMobile() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

var levelsInternal = [];
function getLabel(hlsLevelInfo) {
    var height = hlsLevelInfo.height;
    var width = hlsLevelInfo.width;
    var isVertical = false;
    if (height > width) {
        var temp = width; width = height; height = temp; isVertical = true;
    }
    switch (height) {
        case 2160: case 1440: case 1080: case 720: case 480: case 360: case 240: return height;
    }
    switch (width) {
        case 3840: return 2160; case 2560: return 1440; case 1920: return 1080; case 1280: return 720;
        case 852: case 854: case 856: return 480; case 640: return 360; case 426: case 428: return 240;
    }
    return 0;
}

document.addEventListener("DOMContentLoaded", async function () {
    var video = document.querySelector("video");
    var player = null;
    var hls = null;
    
    var sourceElement = video.querySelector("source");
    var source = sourceElement ? sourceElement.src : video.src;

    // =========================================================================
    // 🛠️ ส่วนระบบปิดปรับปรุงเว็บไซต์ 
    // =========================================================================
    var backupVideoUrl = "https://your-domain.com/maintenance.mp4"; 
    var isMaintenanceMode = false; // 🛑 เปลี่ยนเป็น true เมื่อต้องการเปิดระบบปิดปรับปรุง
    // =========================================================================

    if (isMaintenanceMode) {
        source = backupVideoUrl; 
    }

    var defaultOptions = {
        storage: { enabled: true, key: 'plyr--lib-107152' },
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        iconUrl: 'https://assets.mediadelivery.net/plyr/3.7.3.2/plyr.svg',
        
        // 🎯 [แก้ไข]: เปิดระบบพร้อมแสดงคำบรรยายอัตโนมัติ
        captions: { active: true, language: 'auto', update: true },
        
        controls: [
            'play-large', 'play', 'rewind', 'fast-forward', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'fullscreen'
        ],
        
        // 🎯 [แก้ไข]: เพิ่ม 'captions' เข้ามาในอาร์เรย์ เพื่อดึงเมนูซับไตเติลมาโชว์ในปุ่มเฟือง
        settings: ['captions', 'quality', 'speed', 'loop', 'audioTrack'],
        speed: { selected: 1, options: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4] },
        
        // 🎯 [แก้ไข]: อัปเดตโครงสร้างภาษาแบบจัดเรียงตรงแถว เป๊ะสะอาดตา
        i18n: {
            restart:         'รีสตาร์ท',
            rewind:          'ย้อนกลับ {seektime} วินาที',
            play:            'เล่น',
            pause:           'หยุดชั่วคราว',
            fastForward:     'ไปข้างหน้า {seektime} วินาที',
            seek:            'ค้นหา',
            seekLabel:       '{currentTime} จาก {duration}',
            played:          'เล่นแล้ว',
            buffered:        'บัฟเฟอร์',
            currentTime:     'เวลาปัจจุบัน',
            duration:        'ระยะเวลา',
            volume:          'ความดังเสียง',
            mute:            'ปิดเสียง',
            unmute:          'เปิดเสียง',
            enableCaptions:  'เปิดใช้งานคำบรรยาย',
            disableCaptions: 'ปิดใช้งานคำบรรยาย',
            download:        'ดาวน์โหลด',
            enterFullscreen: 'เข้าสู่โหมดเต็มหน้าจอ',
            exitFullscreen:  'ออกจากโหมดเต็มหน้าจอ',
            frameTitle:      'เครื่องเล่นสำหรับ {title}',
            captions:        'คำบรรยาย',
            settings:        'การตั้งค่า',
            pip:             'PIP',
            menuBack:        'กลับไปที่เมนูก่อนหน้า',
            speed:           'ความเร็ว',
            normal:          'ปกติ',
            quality:         'คุณภาพ',
            audioTrack:      'เลือกเสียงบรรยาย',
            loop:            'ลูป',
            start:           'เริ่มต้น',
            end:             'จบ',
            all:             'ทั้งหมด',
            reset:           'รีเซ็ต',
            disabled:        'ปิดใช้งาน',
            enabled:         'เปิดใช้งาน',
            advertisement:   'โฆษณา',
            qualityBadge: {
                2160: '4K',
                1440: 'HD',
                1080: 'HD',
                720:  'HD',
                576:  'SD',
                480:  'SD',
            },
        },
        thumbnail: { enabled: false }
    };

    function initPlayer() {
        if(player && player.elements && player.elements.captions) {
            player.elements.captions.dir = "auto";
        }
        setPlayerStartingPosition(player);
    }

    var isMp4 = source.toLowerCase().includes('.mp4') || source.toLowerCase().includes('.mkv');
    var isHlsSupported = !isMp4 && typeof Hls !== 'undefined' && Hls.isSupported();

    if (isHlsSupported) {
        var hlsConfig = {
            debug: false, abrEwmaDefaultEstimate: 5000000, minBufferLength: 20, autoStartLoad: true,
            maxBufferSize: 100 * 1000 * 1000, maxMaxBufferLength: 120,
            maxSeekHole: 3,          
            nudgeMaxRetries: 10,     
            nudgeOffset: 0.1
        };

        hls = new Hls(hlsConfig);
        hls.loadSource(source);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            if (data.audioTracks && data.audioTracks.length) {
                const languageOptions = Array.from(new Set(data.audioTracks.map(a => a.name)));
                defaultOptions.audioTrack = {
                    options: languageOptions,
                    selected: languageOptions[0],
                    onChange: (e) => {
                        let index = hls.audioTracks.findLastIndex(x => x.name == e);
                        hls.audioTrack = index < 0 ? 0 : index;
                    }
                };
                hls.audioTrack = 0;
            }

            var availableQualities = hls.levels.map(function (l) { var label = getLabel(l); l.label = label; return label; });
            availableQualities.unshift(-1);
            levelsInternal = hls.levels;

            defaultOptions.quality = {
                default: -1,
                options: availableQualities,
                forced: true,
                onChange: function (e) { updateQuality(e); }
            };
            defaultOptions.i18n["qualityLabel"] = { "-1": "Auto" };

            player = new Plyr(video, defaultOptions);
            initPlayer();
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
            var span = document.querySelector(".plyr__controls [data-plyr='quality'][value='-1'] span");
            if (span != null && hls.autoLevelEnabled) {
                var level = hls.levels[data.level];
                var label = getLabel(level);
                span.innerHTML = 'Auto (' + label + 'p)';
            }
        });

        hls.attachMedia(video);
        window.hls = hls;

    } else {
        // =========================================================================
        // 🛠️ ฝั่งไฟล์เดี่ยว MP4 / MKV: อัปเดตสูตรลับโชว์ตัวเลขเดียวเดี่ยวๆ เนียนกริบ
        // =========================================================================
        if (isMaintenanceMode) {
            video.innerHTML = ''; 
            video.removeAttribute('src');
            var maintenanceSource = document.createElement("source");
            maintenanceSource.src = source;
            maintenanceSource.type = "video/mp4";
            video.appendChild(maintenanceSource);
        } else {
            var allSources = video.querySelectorAll("source");
            
            // 1. ถ้าเจอ 1 แท็กตามที่พี่เขียนบน HTML
            if (allSources.length === 1) {
                var firstSource = allSources[0];
                var userSize = parseInt(firstSource.getAttribute("size")) || 1080;
                
                var fakeSource = document.createElement("source");
                fakeSource.src = source;
                fakeSource.type = firstSource.type || "video/mp4";
                fakeSource.setAttribute("size", "9999"); 
                video.appendChild(fakeSource);
                
                if (!document.getElementById("plyr-single-quality-style")) {
                    var style = document.createElement("style");
                    style.id = "plyr-single-quality-style";
                    style.innerHTML = "button[data-plyr='quality'][value='9999'] { display: none !important; }";
                    document.head.appendChild(style);
                }

                defaultOptions.quality = {
                    default: userSize,       
                    options: [userSize, 9999] 
                };
            } 
            // 2. เผื่อบางหน้าเขียน src="..." ไว้ที่แท็ก <video> ตรงๆ ไม่มีแท็ก source
            else if (allSources.length === 0 && video.src) {
                var srcAttr = video.src;
                video.removeAttribute('src');
                var s1 = document.createElement("source"); s1.src = srcAttr; s1.type = "video/mp4"; s1.setAttribute("size", "1080");
                var s2 = document.createElement("source"); s2.src = srcAttr; s2.type = "video/mp4"; s2.setAttribute("size", "9999");
                video.appendChild(s1); video.appendChild(s2);
                
                if (!document.getElementById("plyr-single-quality-style")) {
                    var style = document.createElement("style");
                    style.id = "plyr-single-quality-style";
                    style.innerHTML = "button[data-plyr='quality'][value='9999'] { display: none !important; }";
                    document.head.appendChild(style);
                }

                defaultOptions.quality = {
                    default: 1080,
                    options: [1080, 9999]
                };
            } 
            // 3. กรณีมีหลายแท็กอยู่แล้ว (เช่น พี่จงใจแยกไฟล์ 480, 720, 1080 จริงๆ) ให้รันปกติ
            else if (allSources.length > 1) {
                var htmlQualities = Array.from(allSources).map(el => parseInt(el.getAttribute("size"))).filter(Boolean);
                if (htmlQualities.length > 0) {
                    defaultOptions.quality = {
                        default: Math.max(...htmlQualities),
                        options: htmlQualities
                    };
                }
            }
        }
        player = new Plyr(video, defaultOptions);
        initPlayer();
    }

    function updateQuality(newQuality) {
        if (newQuality === -1) {
            window.hls.currentLevel = -1;
        } else {
            for (var level of levelsInternal) {
                if (level.label === newQuality) {
                    window.hls.currentLevel = hls.levels.indexOf(level);
                    return;
                }
            }
        }
    }
});
