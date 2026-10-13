import nodemailer from "nodemailer";

let transporter;

async function getEmailTransporter() {
    if (transporter) {
        return transporter;
    }

    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    console.log("\x1b[32mEthereal test email service is ready.\x1b[0m");

    return transporter;
}

export async function sendVerificationEmail({ to, verificationUrl }) {
    const emailTransporter = await getEmailTransporter();

    const info = await emailTransporter.sendMail({
        from: {
            name: "SmartManager",
            address: "no-reply@smartmanager.test",
        },
        to,
        subject: "Verify your SmartManager email",
        text: [
            "Hello,",
            "",
            "Please verify your email address using this link:",
            verificationUrl,
            "",
            "This link is single-use and expires after 30 minutes.",
            "If you did not expect this email, you can ignore it.",
        ].join("\n"),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; line-height: 1.6;">
                <h2>Verify your SmartManager email</h2>
                <p>Please confirm your email address by clicking below.</p>
                <p style="margin: 28px 0;">
                    <a href="${verificationUrl}"
                       style="background: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">
                        Verify email
                    </a>
                </p>
                <p>This link is single-use and expires after 30 minutes.</p>
                <p>If you did not expect this email, you can ignore it.</p>
            </div>
        `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return { messageId: info.messageId, previewUrl };
}

export async function sendPasswordSetupEmail({ to, passwordSetupUrl }) {
    const emailTransporter = await getEmailTransporter();

    const info = await emailTransporter.sendMail({
        from: {
            name: "SmartManager",
            address: "no-reply@smartmanager.test",
        },
        to,
        subject: "Set up your SmartManager password",
        text: [
            "Hello,",
            "",
            "Your email has been verified.",
            "Use the following link to set your SmartManager password:",
            passwordSetupUrl,
            "",
            "This link expires after 30 minutes and can only be used once.",
            "If you did not expect this email, you can ignore it.",
        ].join("\n"),
        html: `
    < div style = "font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; line-height: 1.6;" >
                <h2>Set up your SmartManager password</h2>
                <p>Your email has been verified. Use the link below to choose your password.</p>
                <p style="margin: 28px 0;">
                    <a href="${passwordSetupUrl}"
                       style="background: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">
                        Set up password
                    </a>
                </p>
                <p>This link expires after 30 minutes and can only be used once.</p>
                <p>If you did not expect this email, you can ignore it.</p>
            </div >
    `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return { messageId: info.messageId, previewUrl };
}