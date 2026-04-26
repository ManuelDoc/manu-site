(() => {
  const heroWordRotator = document.querySelector(".hero-word-rotator");

  if (!heroWordRotator) {
    return;
  }

  const heroWords = Array.from(heroWordRotator.querySelectorAll(".hero-word"));
  const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrambleGlyphs = "AEMNRS01<>/{}[]";

  const splitHeroWord = (word) => {
    const letters = Array.from(word.textContent.trim());

    word.textContent = "";

    letters.forEach((letter) => {
      const letterNode = document.createElement("span");

      letterNode.className = "hero-word-letter";
      letterNode.dataset.final = letter;
      letterNode.textContent = letter;
      word.appendChild(letterNode);
    });
  };

  const setFinalLetters = (letters) => {
    letters.forEach((letter) => {
      letter.classList.remove("is-scrambling");
      letter.textContent = letter.dataset.final || "";
    });
  };

  const getScrambleCharacter = (index, frame) => scrambleGlyphs[(index + frame) % scrambleGlyphs.length];

  const scrambleToFinal = (letters, duration = 0.68) => {
    const state = {
      progress: 0,
    };

    return window.gsap.to(state, {
      duration,
      ease: "none",
      onStart: () => {
        letters.forEach((letter, index) => {
          letter.classList.add("is-scrambling");
          letter.textContent = getScrambleCharacter(index, 0);
        });
      },
      onUpdate: () => {
        const frame = Math.floor(state.progress * 26);

        letters.forEach((letter, index) => {
          const settleAt = 0.32 + index * 0.045;

          if (state.progress >= settleAt) {
            letter.classList.remove("is-scrambling");
            letter.textContent = letter.dataset.final || "";
            return;
          }

          letter.textContent = getScrambleCharacter(index, frame);
        });
      },
      onComplete: () => {
        setFinalLetters(letters);
      },
      progress: 1,
    });
  };

  heroWords.forEach(splitHeroWord);

  if (shouldReduceMotion || !window.gsap || heroWords.length === 0) {
    return;
  }

  const timeline = window.gsap.timeline({
    defaults: {
      ease: "power3.out",
    },
    repeat: -1,
  });

  heroWordRotator.classList.add("is-gsap-ready");

  window.gsap.set(heroWords, {
    autoAlpha: 0,
    filter: "blur(0px)",
    rotateX: 0,
    rotateZ: 0,
    skewX: 0,
    transformPerspective: 900,
    xPercent: 0,
    yPercent: 0,
  });

  window.gsap.set(heroWords[0], {
    autoAlpha: 1,
  });

  window.gsap.set(heroWords[0].querySelectorAll(".hero-word-letter"), {
    filter: "blur(0px)",
    opacity: 1,
    rotateX: 0,
    rotateZ: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    xPercent: 0,
    yPercent: 0,
  });

  heroWords.forEach((currentWord, index) => {
    const currentLetters = Array.from(currentWord.querySelectorAll(".hero-word-letter"));
    const nextWord = heroWords[(index + 1) % heroWords.length];
    const nextLetters = Array.from(nextWord.querySelectorAll(".hero-word-letter"));

    timeline
      .to({}, { duration: 1.45 })
      .to(currentLetters, {
        duration: 0.46,
        ease: "power2.in",
        filter: "blur(5px)",
        opacity: 0,
        rotateX: 64,
        rotateZ: -3,
        scaleX: 0.42,
        scaleY: 1.18,
        skewX: -18,
        stagger: {
          amount: 0.18,
          from: "edges",
        },
        xPercent: 16,
        yPercent: -34,
      })
      .set(currentWord, {
        autoAlpha: 0,
      })
      .set(nextWord, {
        autoAlpha: 1,
      })
      .fromTo(
        nextLetters,
        {
          filter: "blur(11px)",
          opacity: 0,
          rotateX: -72,
          rotateZ: 4,
          scaleX: 0.18,
          scaleY: 1.32,
          skewX: 22,
          xPercent: -14,
          yPercent: 72,
        },
        {
          duration: 0.78,
          ease: "expo.out",
          filter: "blur(0px)",
          immediateRender: false,
          opacity: 1,
          rotateX: 0,
          rotateZ: 0,
          scaleX: 1,
          scaleY: 1,
          skewX: 0,
          stagger: {
            amount: 0.3,
            from: "start",
          },
          xPercent: 0,
          yPercent: 0,
        }
      )
      .add(scrambleToFinal(nextLetters), "<0.02")
      .fromTo(
        nextWord,
        {
          letterSpacing: "0.035em",
        },
        {
          duration: 0.7,
          ease: "power3.out",
          immediateRender: false,
          letterSpacing: "0em",
        },
        "<"
      );
  });
})();
