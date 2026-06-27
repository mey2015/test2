// ✂️ สคริปต์ตัดรากถอนโคนแท็กซับไตเติล (ป้องกันการเห็น URL และการดาวน์โหลด)
(function() {
    // 1. สั่งลบแท็ก track ทิ้งทันทีตั้งแต่ไก่โห่ (ถ้ามีหลงเหลืออยู่ใน HTML ตั้งแต่แรก)
    var tracks = document.querySelectorAll('track');
    tracks.forEach(function(track) {
        track.remove();
    });

    // 2. ดักจับและทำลายโค้ดชุดบนของพี่ ทันทีที่มีการพยายามแอบยัดซับกลับเข้ามา
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    // ถ้าตรวจเจอว่ามีแท็ก <track> โผล่เข้ามาในวิดีโอปุ๊บ
                    if (node.tagName === 'TRACK') {
                        node.remove(); // สั่งลบทิ้งทันทีในความเร็วระดับมิลลิวินาที!
                        console.log('🤖 [นายช่าง] บล็อกและทำลายแท็กซับไตเติลเรียบร้อย (ป้องกันการแอบดู URL)');
                    }
                });
            }
        });
    });

    // เริ่มทำงานเฝ้าระวังในตัววิดีโอ
    var videoEl = document.querySelector('video');
    if (videoEl) {
        observer.observe(videoEl, { childList: true, subtree: true });
    }
})();
