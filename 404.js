const wizardButtons = Array.from(document.querySelectorAll("[data-home-step]"));
const wizardProgress = document.querySelector("[data-home-progress]");

if (wizardButtons.length === 3 && wizardProgress) {
  let currentStep = 0;

  const updateProgress = (message) => {
    wizardProgress.textContent = message;
  };

  const enableNextStep = () => {
    const nextButton = wizardButtons[currentStep];

    if (nextButton) {
      nextButton.disabled = false;
      nextButton.focus();
    }
  };

  wizardButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (index !== currentStep) {
        return;
      }

      button.disabled = true;
      button.setAttribute("data-home-done", "true");

      if (index === wizardButtons.length - 1) {
        updateProgress("Path found. Heading home...");

        window.setTimeout(() => {
          window.location.href = "index.html";
        }, 420);

        return;
      }

      currentStep += 1;
      updateProgress(`Heel ${currentStep + 1} of 3.`);
      enableNextStep();
    });
  });
}
