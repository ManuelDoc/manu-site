(() => {
  "use strict";

  const frameDuration = 20;
  const keyboardRows = [
    ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV"],
    ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"],
    ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT"],
    ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"],
    ["Digit0", "Digit9", "Digit8", "Digit7", "Digit6"],
    ["KeyP", "KeyO", "KeyI", "KeyU", "KeyY"],
    ["Enter", "KeyL", "KeyK", "KeyJ", "KeyH"],
    ["Space", "AltRight", "KeyM", "KeyN", "KeyB"],
  ];
  const keys = new Map(keyboardRows.flatMap((row, index) =>
    row.map((code, bit) => [code, [index, 1 << bit]])));
  const aliases = {
    ArrowUp: "KeyQ", ArrowDown: "KeyA", ArrowLeft: "KeyO", ArrowRight: "KeyP",
    ShiftRight: "ShiftLeft", NumpadEnter: "Enter",
  };
  for (let digit = 0; digit < 10; digit++) aliases["Numpad" + digit] = "Digit" + digit;

  const canvas = document.getElementById("spectrum");
  const status = document.getElementById("status");
  const controls = document.getElementById("controls");
  const play = document.getElementById("play");
  const sound = document.getElementById("sound");
  const restart = document.getElementById("restart");
  const fullscreen = document.getElementById("fullscreen");
  const display = new globalThis.SpectrumDisplay(canvas);
  const held = new Map();
  let machine = null;
  let frame = 0;
  let lastTimestamp = null;
  let elapsed = 0;
  let loadedAt = null;
  let queuedPlay = false;
  let loadVersion = 0;
  let audio = null;
  let audioGain = null;
  let soundEnabled = false;
  let soundPreference = true;
  let nextAudioTime = 0;

  function enableSound(enabled) {
    soundEnabled = false;
    if (enabled) {
      const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (AudioContext) {
        try {
          if (!audio) {
            audio = new AudioContext({ latencyHint: "interactive" });
            audioGain = audio.createGain();
            audioGain.connect(audio.destination);
          }
          audio.resume().catch(() => {});
          soundEnabled = true;
        } catch (error) {
          console.warn("Spectrum audio could not be started", error);
        }
      }
    }
    if (audioGain) audioGain.gain.value = soundEnabled ? 0.7 : 0;
    sound.setAttribute("aria-pressed", String(soundEnabled));
  }

  function queueAudio(samples) {
    const buffer = audio.createBuffer(1, samples, audio.sampleRate);
    buffer.copyToChannel(machine.audio(samples), 0);
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(audioGain);
    const now = audio.currentTime;
    if (nextAudioTime < now || nextAudioTime > now + .12) nextAudioTime = now + .035;
    source.start(nextAudioTime);
    nextAudioTime += buffer.duration;
  }

  function press(source, code) {
    if (!machine || !keys.has(code) || held.has(source)) return;
    held.set(source, code);
    machine.key(...keys.get(code), true);
  }

  function release(source) {
    const code = held.get(source);
    if (!code) return;
    held.delete(source);
    if (![...held.values()].includes(code)) machine?.key(...keys.get(code), false);
  }

  function releaseAll() {
    for (const source of held.keys()) release(source);
  }

  function tap(code) {
    const source = Symbol(code);
    press(source, code);
    setTimeout(() => release(source), 105);
  }

  function startGame() {
    if (soundPreference && !soundEnabled) enableSound(true);
    if (loadedAt === null || frame < loadedAt + 12) queuedPlay = true;
    else tap("Digit0");
    canvas.focus({ preventScroll: true });
  }

  function advance() {
    const samples = soundEnabled && audio.state === "running" ? Math.round(audio.sampleRate / 50) : 0;
    machine.step(samples);
    frame++;
    if (samples) queueAudio(samples);
    if (loadedAt === null && machine.tape.nextBlockIndex >= machine.tape.blocks.length) {
      loadedAt = frame;
      status.hidden = true;
    }
    if (queuedPlay && loadedAt !== null && frame >= loadedAt + 12) {
      queuedPlay = false;
      tap("Digit0");
    }
  }

  function showError(error) {
    console.error(error);
    releaseAll();
    machine = null;
    status.textContent = "No se ha podido iniciar el ZX Spectrum en este navegador.";
    status.hidden = false;
    controls.hidden = false;
    play.disabled = true;
  }

  function run(timestamp) {
    if (machine && !document.hidden) {
      elapsed += lastTimestamp === null ? frameDuration : Math.min(timestamp - lastTimestamp, 100);
      lastTimestamp = timestamp;
      try {
        let drewFrame = false;
        while (elapsed >= frameDuration) {
          advance();
          elapsed -= frameDuration;
          drewFrame = true;
        }
        if (drewFrame) display.draw(machine.frame, frame);
      } catch (error) {
        showError(error);
      }
    }
    requestAnimationFrame(run);
  }

  async function boot() {
    const version = ++loadVersion;
    releaseAll();
    machine = null;
    frame = 0;
    loadedAt = null;
    queuedPlay = false;
    elapsed = 0;
    lastTimestamp = null;
    nextAudioTime = 0;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    status.textContent = "Cargando la cinta de ZX Spectrum…";
    status.hidden = false;
    play.disabled = false;
    try {
      const loaded = await globalThis.Spectrum48.load(globalThis.MadMixSpectrumData);
      if (version !== loadVersion) return;
      machine = loaded;
      controls.hidden = false;
    } catch (error) {
      if (version === loadVersion) showError(error);
    }
  }

  document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || (event.altKey && event.code !== "AltRight")) return;
    const code = aliases[event.code] || event.code;
    if (!keys.has(code) || !machine) return;
    if ((code === "Space" || code === "Enter") && event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    if (event.repeat) return;
    if (soundPreference && !soundEnabled) enableSound(true);
    if (code === "Digit0" && (loadedAt === null || frame < loadedAt + 12)) {
      queuedPlay = true;
    } else {
      press(event.code, code);
    }
  });

  document.addEventListener("keyup", ({ code }) => release(code));
  window.addEventListener("blur", releaseAll);
  document.addEventListener("visibilitychange", () => {
    releaseAll();
    lastTimestamp = null;
    elapsed = 0;
    nextAudioTime = 0;
  });

  play.addEventListener("click", startGame);
  restart.addEventListener("click", () => {
    boot();
    canvas.focus({ preventScroll: true });
  });
  sound.addEventListener("click", () => {
    soundPreference = !soundEnabled;
    enableSound(soundPreference);
  });

  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.querySelector("main").requestFullscreen();
      canvas.focus({ preventScroll: true });
    } catch (error) {
      console.warn("Fullscreen could not be changed", error);
    }
  });
  document.addEventListener("fullscreenchange", () => {
    fullscreen.textContent = document.fullscreenElement ? "Salir de pantalla completa" : "Pantalla completa";
  });

  for (const button of document.querySelectorAll("[data-key]")) {
    const code = button.dataset.key;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (soundPreference && !soundEnabled) enableSound(true);
      if (code === "Digit0" && loadedAt === null) {
        queuedPlay = true;
        return;
      }
      if (code.startsWith("Digit")) {
        tap(code);
      } else {
        button.setPointerCapture(event.pointerId);
        press(event.pointerId, code);
      }
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      button.addEventListener(type, (event) => release(event.pointerId));
    }
    button.addEventListener("click", (event) => {
      if (event.detail === 0) tap(code);
    });
  }

  boot();
  requestAnimationFrame(run);
})();
