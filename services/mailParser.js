const Imap = require("imap");
const { simpleParser } = require("mailparser");
const fs = require("fs");
const path = require("path");

const User = require("../models/userModel");
const EmailData = require("../models/emailModel");

/* -----------------------------
   IMAP CONFIG
----------------------------- */
const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
};

/* -----------------------------
   ATTACHMENT SAVE
----------------------------- */
const saveAttachment = (attachment) => {
  const uploadDir = path.join(__dirname, "../uploads/email");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, Date.now() + "-" + attachment.filename);

  fs.writeFileSync(filePath, attachment.content);

  return {
    filename: attachment.filename,
    path: filePath,
    mimetype: attachment.contentType,
    uploadedAt: new Date(),
  };
};

/* -----------------------------
   AI PARSER (GEMINI)
----------------------------- */
const parseWithAI = async (text) => {
  try {
    if (!genAI) return null;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
Extract structured leave request data from this email:

Email:
${text}

Return JSON only:
{
  "employeeEmail": "",
  "employeeName": "",
  "subject": "",
  "leaveReason": "",
  "leaveType": "Sick Leave | Casual Leave | Emergency Leave",
  "leaveDuration": "Full Day | Half Day",
  "startDate": "",
  "endDate": ""
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    return JSON.parse(textResponse);
  } catch (err) {
    return null;
  }
};

/* -----------------------------
   REGEX FALLBACK PARSER
----------------------------- */
const parseWithRegex = (text) => {
  return {
    employeeEmail: text.match(/email:\s*(.*)/i)?.[1] || "",
    employeeName: text.match(/name:\s*(.*)/i)?.[1] || "",
    subject: "Leave Request",
    leaveReason: text,
    leaveType: "Casual Leave",
    leaveDuration: "Full Day",
    startDate: null,
    endDate: null,
  };
};

/* -----------------------------
   PROCESS EMAIL
----------------------------- */
const processEmail = async (mail) => {
  try {
    const rawText = mail.text || mail.html || "";

    let parsed = await parseWithAI(rawText);

    if (!parsed) {
      parsed = parseWithRegex(rawText);
    }

    /* Find user */
    const user = await User.findOne({
      where: { email: parsed.employeeEmail.toLowerCase() },
    });

    const attachments = [];

    if (mail.attachments && mail.attachments.length > 0) {
      for (const att of mail.attachments) {
        attachments.push(saveAttachment(att));
      }
    }

    const emailEntry = await EmailData.create({
      employeeId: user ? user.id : null,
      employeeName: parsed.employeeName,
      employeeEmail: parsed.employeeEmail.toLowerCase(),
      subject: parsed.subject,
      leaveReason: parsed.leaveReason,
      leaveType: parsed.leaveType,
      leaveDuration: parsed.leaveDuration,
      startDate: parsed.startDate || null,
      endDate: parsed.endDate || null,
      status: "Pending",
      attachments,
      rawEmailId: mail.messageId,
      isPaid: true,
      submissionCount: 1,
    });

    console.log("Email processed:", emailEntry.id);
  } catch (err) {
    console.error("Email processing error:", err.message);
  }
};

/* -----------------------------
   START IMAP LISTENER
----------------------------- */
const startEmailListener = () => {
  if (process.env.ENABLE_EMAIL !== "true") {
    console.log("Email listener disabled");
    return;
  }

  const imap = new Imap(imapConfig);

  imap.once("ready", () => {
    imap.openBox("INBOX", false, () => {
      console.log("IMAP connected - listening for emails");

      imap.on("mail", () => {
        const fetch = imap.seq.fetch("*", {
          bodies: "",
          struct: true,
        });

        fetch.on("message", (msg) => {
          msg.on("body", async (stream) => {
            const parsed = await simpleParser(stream);
            await processEmail(parsed);
          });
        });
      });
    });
  });

  imap.once("error", (err) => {
    console.error("IMAP Error:", err);
  });

  imap.connect();
};

module.exports = {
  startEmailListener,
};