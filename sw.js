<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#000000">
  
  <!-- PWA Meta Tags -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="AailaPasa">
  
  <!-- Favicon & Apple Touch Icons -->
  <link rel="icon" href="/icons/favicon.ico">
  <link rel="apple-touch-icon" href="/icons/icon-180x180.png">
  
  <!-- Splash Screens (iOS) -->
  <link rel="apple-touch-startup-image" href="/splash/iphone5_splash.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/splash/iphone6_splash.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  
  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json">
  
  <title>Aaila Pasa</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
      background-color: #f5f5f5;
    }
    #installBtn {
      background: #000;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      margin: 20px 0;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>Welcome to Aaila Pasa</h1>
  <p>A progressive web app experience</p>
  
  <button id="installBtn" style="display: none;">Install App</button>

  <script>
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('SW registered:', reg))
          .catch(err => console.log('SW registration failed:', err));
      });
    }

    // Handle PWA installation prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      document.getElementById('installBtn').style.display = 'block';
    });

    document.getElementById('installBtn').addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted install');
          }
          deferredPrompt = null;
        });
      }
    });
  </script>
</body>
</html>
