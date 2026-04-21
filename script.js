const focusFormStatus = ({ form }, error) => {
  if (error) {
    console.error("Formspree submission error", error);
  }

  const parent = form.parentElement;
  const status = parent ? parent.querySelector("[data-fs-error]") : null;

  if (!status) {
    return;
  }

  window.requestAnimationFrame(() => {
    status.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
};

window.formspree =
  window.formspree ||
  function () {
    (window.formspree.q = window.formspree.q || []).push(arguments);
  };

window.formspree("initForm", {
  formElement: "#contact-form",
  formId: "xzdygglk",
  data: {
    source: "website-contact-form",
  },
  onError: focusFormStatus,
  onFailure: focusFormStatus,
  renderSuccess: () => {
    window.location.assign("thank-you.html");
  },
});
