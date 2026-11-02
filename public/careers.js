(() => {
  const query = new URLSearchParams(window.location.search);
  // Opened from an archived concept page, the home links go back to it; otherwise to the homepage.
  const archivedHome = { 1: "/concept-1.html", 2: "/concept-2.html" }[query.get("concept")];

  document.querySelectorAll("[data-concept-home]").forEach((link) => {
    link.href = archivedHome || "/";
  });

  const year = document.querySelector("#careers-year");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.querySelector("#careers-form");
  const status = document.querySelector("#careers-status");
  if (!form) return;

  const upload = form.querySelector("[data-upload]");
  const resume = form.elements.namedItem("Resume");
  const maxResumeBytes = 10 * 1024 * 1024;
  const formatSize = (bytes) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  // A dropped file skips the input's accept filter, so the type is checked here too.
  function showResume() {
    const file = resume.files[0];
    let problem = "";
    if (file && !/\.(pdf|docx?)$/i.test(file.name)) problem = "Choose a PDF, DOC, or DOCX file.";
    else if (file && file.size > maxResumeBytes) problem = "Choose a file smaller than 10 MB.";
    resume.setCustomValidity(problem);
    upload.classList.toggle("has-file", Boolean(file));
    upload.classList.toggle("is-invalid", Boolean(problem));
    upload.querySelector("[data-upload-prompt]").hidden = Boolean(file);
    upload.querySelector("[data-upload-file]").hidden = !file;
    upload.querySelector("[data-upload-name]").textContent = file ? file.name : "";
    upload.querySelector("[data-upload-size]").textContent = file ? formatSize(file.size) : "";
    form.querySelector("[data-upload-error]").textContent = problem;
  }

  resume.addEventListener("change", showResume);
  ["dragenter", "dragover"].forEach((type) => resume.addEventListener(type, () => upload.classList.add("is-dragging")));
  ["dragleave", "drop"].forEach((type) => resume.addEventListener(type, () => upload.classList.remove("is-dragging")));
  upload.querySelector("[data-upload-remove]").addEventListener("click", () => {
    resume.value = "";
    showResume();
    resume.focus();
  });
  showResume();

  // There is no upload backend yet, so the form prepares an email and the applicant attaches the chosen resume themselves.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const fields = [...new FormData(form).entries()].filter(([, value]) => typeof value === "string" && value.trim());
    const name = ["First name", "Last name"].map((field) => form.elements.namedItem(field).value.trim()).join(" ");
    const interest = form.elements.namedItem("Area of interest").value;
    const resumeName = resume.files[0].name;
    const body = [...fields.map(([label, value]) => `${label}: ${value.trim()}`), "", `Resume: ${resumeName} (attached)`].join("\n");
    const subject = `Resume: ${name} - ${interest}`;
    if (status) status.textContent = `Opening your email app with your details filled in. Attach ${resumeName} before you send it.`;
    window.location.href = `mailto:careers@siliconeng.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
