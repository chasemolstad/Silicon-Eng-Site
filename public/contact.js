(() => {
  const query = new URLSearchParams(window.location.search);
  // Opened from an archived concept page, the home links go back to it; otherwise to the homepage.
  const archivedHome = { 1: "/archive/concept-1.html", 2: "/archive/concept-2.html" }[query.get("concept")];

  document.querySelectorAll("[data-concept-home]").forEach((link) => {
    link.href = archivedHome || "/";
  });

  const year = document.querySelector("#contact-year");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#contact-status");
  if (!form) return;

  // The form posts to the "forms" Cloud Function (functions/index.js), which emails it to info@siliconeng.com.
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submit = form.querySelector("[type=submit]");
    submit.disabled = true;
    status.textContent = "Sending your message…";
    try {
      const response = await fetch("/api/contact", { method: "POST", body: new FormData(form) });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error);
      form.reset();
      status.textContent = "Thank you. Your message has been sent, and our team will be in touch soon.";
    } catch (error) {
      status.textContent = `${error.message || "Your message could not be sent."} You can also email us at info@siliconeng.com.`;
    } finally {
      submit.disabled = false;
    }
  });
})();
