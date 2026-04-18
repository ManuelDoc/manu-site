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
  renderSuccess: () => {
    window.location.assign("thank-you.html");
  },
});
