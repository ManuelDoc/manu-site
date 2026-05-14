(() => {
  const heroWordRotator = document.querySelector(".hero-word-rotator");

  if (!heroWordRotator) {
    return;
  }

  const sourceWords = Array.from(heroWordRotator.querySelectorAll(".hero-word"));
  const words = sourceWords.map((word) => word.textContent.trim()).filter(Boolean);
  const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const scrambleGlyphs = "AENRS01<>/[]";
  const characterWidths = new Map();

  if (words.length < 2 || (motionQuery && motionQuery.matches)) {
    return;
  }

  const maxLetterCount = Math.max(...words.map((word) => Array.from(word).length));
  const displayWord = document.createElement("span");
  const letterSlots = [];
  let activeIndex = 0;
  let animationFrame = null;
  let rotationTimer = null;
  let isAnimating = false;

  displayWord.className = "hero-word hero-word--display";
  heroWordRotator.prepend(displayWord);
  heroWordRotator.classList.add("is-scramble-ready");

  for (let index = 0; index < maxLetterCount; index += 1) {
    const slot = document.createElement("span");

    slot.className = "hero-word-slot";
    displayWord.appendChild(slot);
    letterSlots.push(slot);
  }

  const getSlotWidth = (letter) => {
    if (!letter) {
      return 0;
    }

    return Math.ceil(characterWidths.get(letter) || 0) + 1;
  };

  const getAllowedGlyphs = (width) => {
    const glyphs = Array.from(scrambleGlyphs)
      .filter((character) => Math.ceil(characterWidths.get(character) || 0) <= width)
      .join("");

    return glyphs || "1/<>";
  };

  const getScrambleCharacter = (slot, slotIndex, frame) => {
    const glyphs = slot.dataset.scrambleGlyphs || scrambleGlyphs;

    return glyphs[(slotIndex + frame) % glyphs.length];
  };

  const measureSlotWidths = () => {
    const measure = document.createElement("span");
    const characters = new Set(Array.from(scrambleGlyphs));

    measure.className = "hero-word-slot";
    measure.style.display = "inline-block";
    measure.style.left = "-9999px";
    measure.style.position = "absolute";
    measure.style.visibility = "hidden";
    measure.style.width = "auto";
    heroWordRotator.appendChild(measure);

    words.forEach((word) => {
      Array.from(word).forEach((letter) => {
        characters.add(letter);
      });
    });

    characters.forEach((character) => {
      measure.textContent = character;
      characterWidths.set(character, measure.getBoundingClientRect().width);
    });

    measure.remove();
  };

  const renderWord = (word) => {
    const letters = Array.from(word);

    letterSlots.forEach((slot, index) => {
      const letter = letters[index] || "";

      slot.classList.toggle("is-empty", !letter);
      slot.classList.remove("is-scrambling");
      slot.classList.add("is-settled");
      slot.dataset.current = letter;
      slot.textContent = letter;
      slot.style.width = `${getSlotWidth(letter)}px`;
    });
  };

  const stopRotation = () => {
    window.clearTimeout(rotationTimer);
    rotationTimer = null;

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    isAnimating = false;
  };

  const scheduleRotation = () => {
    window.clearTimeout(rotationTimer);
    rotationTimer = window.setTimeout(() => {
      activeIndex = (activeIndex + 1) % words.length;
      animateToWord(words[activeIndex]);
    }, 1700);
  };

  const settleMutation = (mutation) => {
    const { finalLetter, slot } = mutation;

    slot.classList.remove("is-scrambling");

    if (!finalLetter) {
      slot.classList.add("is-empty");
      slot.dataset.current = "";
      slot.textContent = "";
      slot.style.width = "0px";
      return;
    }

    slot.classList.remove("is-empty");
    slot.classList.add("is-settled");
    slot.dataset.current = finalLetter;
    slot.textContent = finalLetter;
    slot.style.width = `${getSlotWidth(finalLetter)}px`;
  };

  const animateToWord = (word) => {
    if (isAnimating) {
      return;
    }

    const letters = Array.from(word);
    const startedAt = window.performance.now();
    const mutations = letterSlots.map((slot, index) => {
      const currentLetter = slot.dataset.current || "";
      const finalLetter = letters[index] || "";
      const startWidth = getSlotWidth(currentLetter);
      const endWidth = getSlotWidth(finalLetter);

      slot.dataset.scrambleGlyphs = getAllowedGlyphs(Math.max(startWidth, endWidth));
      slot.classList.remove("is-empty", "is-settled");
      slot.classList.add("is-scrambling");

      if (!currentLetter && !finalLetter) {
        slot.classList.add("is-empty");
      }

      return {
        delay: index * 44,
        duration: finalLetter ? 520 : 360,
        endWidth,
        finalLetter,
        slot,
        startWidth,
      };
    });
    const totalDuration = Math.max(...mutations.map((mutation) => mutation.delay + mutation.duration));

    isAnimating = true;

    const tick = (now) => {
      let hasActiveMutation = false;

      mutations.forEach((mutation, index) => {
        const elapsed = now - startedAt - mutation.delay;

        if (elapsed < 0) {
          hasActiveMutation = true;
          return;
        }

        const progress = Math.min(elapsed / mutation.duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const width = mutation.startWidth + (mutation.endWidth - mutation.startWidth) * easedProgress;

        mutation.slot.style.width = `${Math.max(0, Math.round(width))}px`;

        if (!mutation.finalLetter && progress > 0.64) {
          mutation.slot.classList.add("is-empty");
          mutation.slot.textContent = "";
        } else if (mutation.finalLetter && progress > 0.72) {
          mutation.slot.classList.remove("is-scrambling");
          mutation.slot.classList.add("is-settled");
          mutation.slot.dataset.current = mutation.finalLetter;
          mutation.slot.textContent = mutation.finalLetter;
        } else if (mutation.finalLetter || mutation.slot.dataset.current) {
          mutation.slot.textContent = getScrambleCharacter(mutation.slot, index, Math.floor(progress * 32));
        }

        if (progress < 1) {
          hasActiveMutation = true;
        }
      });

      if (hasActiveMutation && now - startedAt <= totalDuration + 80) {
        animationFrame = window.requestAnimationFrame(tick);
        return;
      }

      mutations.forEach(settleMutation);
      isAnimating = false;
      animationFrame = null;
      scheduleRotation();
    };

    animationFrame = window.requestAnimationFrame(tick);
  };

  measureSlotWidths();
  renderWord(words[0]);
  scheduleRotation();

  if (document.fonts) {
    document.fonts.ready.then(() => {
      measureSlotWidths();
      renderWord(words[activeIndex]);
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRotation();
      return;
    }

    scheduleRotation();
  });

  if (motionQuery && motionQuery.addEventListener) {
    motionQuery.addEventListener("change", (event) => {
      if (event.matches) {
        stopRotation();
        return;
      }

      scheduleRotation();
    });
  }
})();
