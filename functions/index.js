// Receives the Contact and Careers forms (POST /api/contact, /api/careers via the Hosting rewrite in firebase.json)
// and emails each submission from SiliconEng's Private Email account, with the visitor as the reply-to address.
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const busboy = require("busboy");
const nodemailer = require("nodemailer");

// Set with: firebase functions:secrets:set SMTP_PASSWORD (the info@siliconeng.com mailbox password).
const smtpPassword = defineSecret("SMTP_PASSWORD");
const sender = "info@siliconeng.com";
const maxResumeBytes = 10 * 1024 * 1024;

// Field names match the name attributes in contact.html and careers.html; they are listed in the email in this order.
const forms = {
  contact: {
    to: "info@siliconeng.com",
    fields: ["First name", "Last name", "Email", "Company", "Job title", "Interest", "Country", "How you heard about us", "Message"],
    required: ["First name", "Last name", "Email", "Company", "Interest", "Country", "Message"],
    subject: (f) => `Website inquiry: ${f["First name"]} ${f["Last name"]}, ${f.Company}`,
  },
  careers: {
    to: "info@siliconeng.com",
    fields: ["First name", "Last name", "Email", "Phone", "Area of interest", "Experience", "Location", "LinkedIn or portfolio", "Message"],
    required: ["First name", "Last name", "Email", "Area of interest"],
    resume: true,
    subject: (f) => `Resume: ${f["First name"]} ${f["Last name"]} - ${f["Area of interest"]}`,
  },
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    const parser = busboy({ headers: req.headers, limits: { fields: 30, fieldSize: 20000, files: 1, fileSize: maxResumeBytes } });
    parser.on("field", (name, value) => { fields[name] = value.trim(); });
    parser.on("file", (name, stream, { filename, mimeType }) => {
      const chunks = [];
      let tooLarge = false;
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("limit", () => { tooLarge = true; });
      stream.on("close", () => files.push({ name, filename, contentType: mimeType, content: Buffer.concat(chunks), tooLarge }));
    });
    parser.on("close", () => resolve({ fields, files }));
    parser.on("error", reject);
    parser.end(req.rawBody);
  });
}

exports.forms = onRequest({ secrets: [smtpPassword], maxInstances: 3, memory: "256MiB" }, async (req, res) => {
  res.set("Cache-Control", "no-store");
  const form = forms[req.path.split("/").pop()];
  if (req.method !== "POST" || !form) return res.status(404).json({ error: "Not found." });

  let fields, files;
  try {
    ({ fields, files } = await parseForm(req));
  } catch (error) {
    return res.status(400).json({ error: "The form could not be read." });
  }

  // The hidden _trap field is invisible to people; bots that fill every field get a quiet success and no email.
  if (fields._trap) return res.json({ ok: true });

  const missing = form.required.filter((name) => !fields[name]);
  if (missing.length) return res.status(400).json({ error: `Please fill in: ${missing.join(", ")}.` });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.Email)) return res.status(400).json({ error: "Please enter a valid email address." });

  const attachments = [];
  if (form.resume) {
    const resume = files.find((file) => file.name === "Resume" && file.content.length);
    if (!resume) return res.status(400).json({ error: "Please attach your resume." });
    if (resume.tooLarge) return res.status(400).json({ error: "Choose a resume smaller than 10 MB." });
    if (!/\.(pdf|docx?)$/i.test(resume.filename)) return res.status(400).json({ error: "Choose a PDF, DOC, or DOCX file." });
    attachments.push({ filename: resume.filename, content: resume.content, contentType: resume.contentType });
  }

  const name = `${fields["First name"]} ${fields["Last name"]}`;
  const text = form.fields.filter((field) => fields[field]).map((field) => `${field}: ${fields[field]}`).join("\n");
  const transport = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: { user: sender, pass: smtpPassword.value() },
  });

  try {
    await transport.sendMail({
      from: { name: "SiliconEng website", address: sender },
      to: form.to,
      replyTo: { name, address: fields.Email },
      subject: form.subject(fields).replace(/[\r\n]+/g, " "),
      text: `${text}\n\nSent from the form at siliconeng.com. Reply to this email to answer ${name}.`,
      attachments,
    });
  } catch (error) {
    logger.error("Could not send form email", error);
    return res.status(502).json({ error: "The message could not be sent." });
  }
  res.json({ ok: true });
});
