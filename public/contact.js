(() => {
  const query = new URLSearchParams(window.location.search);
  const requestedConcept = query.get("concept");
  const concept = requestedConcept === "1" ? "1" : "2";

  document.querySelectorAll("[data-concept-home]").forEach((link) => {
    link.href = `/?concept=${concept}`;
  });

  const year = document.querySelector("#contact-year");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#contact-status");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const fields = [...new FormData(form).entries()];
    const company = form.elements.namedItem("Company").value.trim();
    const body = fields.map(([label, value]) => `${label}: ${value}`).join("\n");
    const subject = `SiliconEng website inquiry${company ? ` - ${company}` : ""}`;
    if (status) status.textContent = "Opening your email app with the message ready to send.";
    window.location.href = `mailto:info@siliconeng.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
