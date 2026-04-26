(() => {
  const heroWordRotator = document.querySelector(".hero-word-rotator");

  if (!heroWordRotator) {
    return;
  }

  const sourceWords = Array.from(heroWordRotator.querySelectorAll(".hero-word"));
  const words = sourceWords.map((word) => word.textContent.trim()).filter(Boolean);
  const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrambleGlyphs = "AENRS01<>/[]";
  const characterWidths = new Map();

  if (shouldReduceMotion || !window.gsap || words.length === 0) {
    return;
  }

  const maxLetterCount = Math.max(...words.map((word) => Array.from(word).length));
  const displayWord = document.createElement("span");
  const letterSlots = [];

  displayWord.className = "hero-word hero-word--display";
  heroWordRotator.prepend(displayWord);
  heroWordRotator.classList.add("is-gsap-ready");

  for (let index = 0; index < maxLetterCount; index += 1) {
    const slot = document.createElement("span");

    slot.className = "hero-word-slot";
    displayWord.appendChild(slot);
    letterSlots.push(slot);
  }

  const getScrambleCharacter = (slot, slotIndex, frame) => {
    const glyphs = slot.dataset.scrambleGlyphs || scrambleGlyphs;

    return glyphs[(slotIndex + frame) % glyphs.length];
  };

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

    const measureCharacter = (character) => {
      if (!characterWidths.has(character)) {
        measure.textContent = character;
        characterWidths.set(character, measure.getBoundingClientRect().width);
      }

      return characterWidths.get(character);
    };

    characters.forEach(measureCharacter);

    letterSlots.forEach((slot) => {
      slot.style.width = `${getSlotWidth(slot.dataset.current || "")}px`;
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

  const addSlotMutation = (timeline, slot, finalLetter, slotIndex, startAt) => {
    const state = {
      progress: 0,
      shouldSkip: false,
    };

    timeline.call(() => {
      state.progress = 0;
      state.shouldSkip = !finalLetter && !slot.dataset.current;
      slot.dataset.scrambleGlyphs = getAllowedGlyphs(Math.max(getSlotWidth(finalLetter), getSlotWidth(slot.dataset.current || "")));

      if (state.shouldSkip) {
        slot.classList.add("is-empty");
        slot.textContent = "";
        return;
      }

      slot.classList.remove("is-empty", "is-settled");
      slot.classList.add("is-scrambling");
      slot.textContent = getScrambleCharacter(slot, slotIndex, 0);
    }, [], startAt);

    timeline.to(slot, {
      duration: finalLetter ? 0.42 : 0.28,
      ease: "power2.out",
      width: getSlotWidth(finalLetter),
    }, startAt);

    timeline.to(state, {
      duration: finalLetter ? 0.5 : 0.32,
      ease: "none",
      onUpdate: () => {
        if (state.shouldSkip) {
          return;
        }

        const frame = Math.floor(state.progress * 32);

        if (!finalLetter && state.progress > 0.64) {
          slot.classList.remove("is-scrambling");
          slot.classList.add("is-empty");
          slot.dataset.current = "";
          slot.textContent = "";
          return;
        }

        if (finalLetter && state.progress > 0.72) {
          slot.classList.remove("is-scrambling");
          slot.classList.add("is-settled");
          slot.dataset.current = finalLetter;
          slot.textContent = finalLetter;
          return;
        }

        slot.textContent = getScrambleCharacter(slot, slotIndex, frame);
      },
      onComplete: () => {
        if (state.shouldSkip) {
          return;
        }

        slot.classList.remove("is-scrambling");

        if (!finalLetter) {
          slot.classList.add("is-empty");
          slot.dataset.current = "";
          slot.textContent = "";
          return;
        }

        slot.classList.add("is-settled");
        slot.dataset.current = finalLetter;
        slot.textContent = finalLetter;
      },
      progress: 1,
    }, startAt);
  };

  const addWordMutation = (timeline, word) => {
    const letters = Array.from(word);
    const startAt = timeline.duration();

    letterSlots.forEach((slot, index) => {
      addSlotMutation(timeline, slot, letters[index] || "", index, startAt + index * 0.045);
    });
  };

  const timeline = window.gsap.timeline({
    paused: true,
    repeat: -1,
  });

  measureSlotWidths();
  renderWord(words[0]);

  if (document.fonts) {
    document.fonts.ready.then(measureSlotWidths);
  }

  words.forEach((word, index) => {
    const nextWord = words[(index + 1) % words.length];

    timeline.to({}, { duration: index === 0 ? 1.3 : 1.55 });
    addWordMutation(timeline, nextWord);
  });

  timeline.play(0);
})();
