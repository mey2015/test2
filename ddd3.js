
    // Initialize Plyr
    const player = new Plyr('#main-video', {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen']
    });

    // Hide cast button when video starts playing
    player.on('play', () => {
        document.getElementById('castButton').style.display = 'block';
    });

    // Check Cast API availability
    function checkCastApiAvailability() {
        if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
            initializeCastApi();
        } else {
            setTimeout(checkCastApiAvailability, 1000);
        }
    }

    window.addEventListener('load', checkCastApiAvailability);

    function initializeCastApi() {
        try {
            const context = cast.framework.CastContext.getInstance();
            
            context.setOptions({
                receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });

            const castButton = document.getElementById('castButton');

            // Show/hide cast button based on cast state
            context.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, function(event) {
                castButton.style.display = event.castState !== cast.framework.CastState.NO_DEVICES_AVAILABLE ? 'block' : 'none';
            });

            // Cast button click event
            castButton.addEventListener('click', function() {
                if (context.getCastState() === cast.framework.CastState.CONNECTED) {
                    context.endCurrentSession(true);
                } else {
                    context.requestSession().then(
                        function() {
                            loadMedia();
                        },
                        function(error) {
                            showErrorMessage('Error connecting to Cast: ' + error.description);
                        }
                    );
                }
            });

        } catch (error) {
            console.error('Error initializing Cast API:', error);
        }
    }

    function loadMedia() {
        const context = cast.framework.CastContext.getInstance();
        const session = context.getCurrentSession();
        
        if (session) {
            const mediaInfo = new chrome.cast.media.MediaInfo(player.source, 'video/mp4');
            
            mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
            mediaInfo.metadata.title = 'Video Title';
            
            const request = new chrome.cast.media.LoadRequest(mediaInfo);
            
            session.loadMedia(request).then(
                function() {
                    console.log('Media loaded successfully');
                    document.getElementById('errorMessage').style.display = 'none';
                },
                function(error) {
                    showErrorMessage('Error loading media: ' + error.description);
                }
            );
        }
    }

    function showErrorMessage(message) {
        const errorMessageDiv = document.getElementById('errorMessage');
        
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }

