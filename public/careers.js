(() => {
  const query = new URLSearchParams(window.location.search);
  const requestedConcept = query.get("concept");
  const concept = ["2", "3", "4"].includes(requestedConcept) ? requestedConcept : "2";

  document.querySelectorAll("[data-concept-home]").forEach((link) => {
    link.href = `/?concept=${concept}`;
  });

  const year = document.querySelector("#careers-year");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.querySelector("#careers-form");
  const status = document.querySelector("#careers-status");
  if (!form) return;

  // There is no upload backend, so the form prepares an email and the applicant attaches the resume themselves.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const fields = [...new FormData(form).entries()].filter(([, value]) => value.trim());
    const name = ["First name", "Last name"].map((field) => form.elements.namedItem(field).value.trim()).join(" ");
    const interest = form.elements.namedItem("Area of interest").value;
    const body = [...fields.map(([label, value]) => `${label}: ${value.trim()}`), "", "Resume attached."].join("\n");
    const subject = `Resume: ${name} - ${interest}`;
    if (status) status.textContent = "Opening your email app with your details filled in. Attach your resume before you send it.";
    window.location.href = `mailto:careers@siliconeng.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
