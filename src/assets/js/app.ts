import confetti from 'canvas-confetti';
import Slot from '@js/Slot';
import SoundEffects from '@js/SoundEffects';

// Initialize slot machine
(() => {
  const drawButton = document.getElementById('draw-button') as HTMLButtonElement | null;
  const startRotationLuckyButton = document.getElementById('start-rotation-lucky') as HTMLButtonElement;
  const fullscreenButton = document.getElementById('fullscreen-button') as HTMLButtonElement | null;
  const settingsButton = document.getElementById('settings-button') as HTMLButtonElement | null;
  const settingsWrapper = document.getElementById('settings') as HTMLDivElement | null;
  const settingsContent = document.getElementById('settings-panel') as HTMLDivElement | null;
  const settingsSaveButton = document.getElementById('settings-save') as HTMLButtonElement | null;
  const settingsCloseButton = document.getElementById('settings-close') as HTMLButtonElement | null;
  const sunburstSvg = document.getElementById('sunburst') as HTMLImageElement | null;
  const confettiCanvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
  const nameListTextArea = document.getElementById('name-list') as HTMLTextAreaElement | null;
  const removeNameFromListCheckbox = document.getElementById('remove-from-list') as HTMLInputElement | null;
  const enableSoundCheckbox = document.getElementById('enable-sound') as HTMLInputElement | null;

  // Graceful exit if necessary elements are not found
  if (!(
    drawButton
    && fullscreenButton
    && settingsButton
    && settingsWrapper
    && settingsContent
    && settingsSaveButton
    && settingsCloseButton
    && sunburstSvg
    && confettiCanvas
    && nameListTextArea
    && removeNameFromListCheckbox
    && enableSoundCheckbox
  )) {
    console.error('One or more Element ID is invalid. This is possibly a bug.');
    return;
  }

  if (!(confettiCanvas instanceof HTMLCanvasElement)) {
    console.error('Confetti canvas is not an instance of Canvas. This is possibly a bug.');
    return;
  }

  const soundEffects = new SoundEffects();
  const MAX_REEL_ITEMS = 200;
  const CONFETTI_COLORS = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];
  let confettiAnimationId;

  /** Confeetti animation instance */
  const customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  /** Triggers cconfeetti animation until animation is canceled */
  const confettiAnimation = () => {
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    const confettiScale = Math.max(0.5, Math.min(1, windowWidth / 1100));

    customConfetti({
      particleCount: 1,
      gravity: 0.8,
      spread: 90,
      origin: { y: 0.6 },
      colors: [CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]],
      scalar: confettiScale
    });

    confettiAnimationId = window.requestAnimationFrame(confettiAnimation);
  };

  /** Function to stop the winning animation */
  const stopWinningAnimation = () => {
    if (confettiAnimationId) {
      window.cancelAnimationFrame(confettiAnimationId);
    }
    sunburstSvg.style.display = 'none';
  };

  /**  Function to be trigger before spinning */
  const onSpinStart = () => {
    stopWinningAnimation();
    drawButton.disabled = true;
    settingsButton.disabled = true;
    soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
  };

  /**  Functions to be trigger after spinning */
  const onSpinEnd = async () => {
    confettiAnimation();
    sunburstSvg.style.display = 'block';
    await soundEffects.win();
    drawButton.disabled = false;
    settingsButton.disabled = false;
  };

  /** Slot instance */
  const slot = new Slot({
    reelContainerSelector: '#reel',
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation
  });

  /** To open the setting page */
  const onSettingsOpen = () => {
    nameListTextArea.value = slot.names.length ? slot.names.join('\n') : '';
    removeNameFromListCheckbox.checked = slot.shouldRemoveWinnerFromNameList;
    enableSoundCheckbox.checked = !soundEffects.mute;
    settingsWrapper.style.display = 'block';
  };

  /** To close the setting page */
  const onSettingsClose = () => {
    settingsContent.scrollTop = 0;
    settingsWrapper.style.display = 'none';
  };

  // Click handler for "Draw" button
  drawButton.addEventListener('click', () => {
    if (!slot.names.length) {
      // onSettingsOpen();
      alert('Please Call List User')
      return;
    }

    slot.spin();
  });

  // Hide fullscreen button when it is not supported
  // if (!(document.documentElement.requestFullscreen && document.exitFullscreen)) {
  //   fullscreenButton.remove();
  // }

  // Click handler for "Fullscreen" button
  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  });

  // Click handler for "Settings" button

  settingsButton.addEventListener('click', onSettingsOpen);

  // Click handler for "Save" button for setting page
  settingsSaveButton.addEventListener('click', () => {
    slot.names = nameListTextArea.value
      ? nameListTextArea.value.split(/\n/).filter((name) => Boolean(name.trim()))
      : [];
    slot.shouldRemoveWinnerFromNameList = removeNameFromListCheckbox.checked;
    soundEffects.mute = !enableSoundCheckbox.checked;
    onSettingsClose();
    // console.log(333, slot.names)
  });

  // Click handler for "Discard and close" button for setting page
  settingsCloseButton.addEventListener('click', onSettingsClose);

  // ========================UYENDO======================================

  const loadListUser = () => {
    fetch('https://ritavo-mega-depot.xyz/api/visitors', {
      method: 'GET', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        // console.log('Success:', data);
        if (data.status === true) {
          const result: any[] = [];
          for (let i = 0; i < data.data.length; i++) {
            let obj = [
              data.data[i].name,
              data.data[i].code
            ]
            result.push(obj)
          }
          slot.names = result;
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }


  // on click start rotation
  const onStartRotationLucky = () => {
    const stepNumber = document.querySelector(".step-number")
    const step2 = document.querySelector(".step-2")
    stepNumber?.classList.remove('active')
    step2?.classList.add('active')

    document.querySelector(".uyendo")?.classList.add('none-border')
  };
  startRotationLuckyButton.addEventListener('click', onStartRotationLucky);



  // load loai giai thuong theo URL 
  const onLoadLuckyType = () => {
    const wrapAttr = document.querySelector(".wrap")
    const search = location.search.split('?lucky=')[1]
    console.log(search)
    wrapAttr?.classList.remove('active');
    if (search != undefined) {
      document.querySelector(`#${search}`)?.classList.add('active')
    } else {
      document.querySelector(`#nem-1`)?.classList.add('active')
    }

    const hasActiveStep2 = document.querySelector(`.step-2`)?.classList.contains('active');
    if (hasActiveStep2) {
      document.querySelector(".uyendo")?.classList.add('none-border')
    }
  };
  window.onload = function () {
    onLoadLuckyType()
    loadListUser()
  };

})();
