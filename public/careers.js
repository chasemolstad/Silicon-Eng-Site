(() => {
  const query = new URLSearchParams(window.location.search);
  // Opened from an archived concept page, the home links go back to it; otherwise to the homepage.
  const archivedHome = { 1: "/archive/concept-1.html", 2: "/archive/concept-2.html" }[query.get("concept")];

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

  // The form and resume post to the "forms" Cloud Function (functions/index.js), which emails them to info@siliconeng.com.
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submit = form.querySelector("[type=submit]");
    submit.disabled = true;
    status.textContent = "Sending your application…";
    try {
      const response = await fetch("/api/careers", { method: "POST", body: new FormData(form) });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error);
      form.reset();
      showResume();
      status.textContent = "Thank you. Your application has been sent, and our team will be in touch if there is a fit.";
    } catch (error) {
      status.textContent = `${error.message || "Your application could not be sent."} You can also email your resume to info@siliconeng.com.`;
    } finally {
      submit.disabled = false;
    }
  });
})();
