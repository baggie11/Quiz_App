import nodemailer from 'nodemailer';
import crypto from 'crypto';

/**
 * Generate a cryptographically secure verification token
 * @param {number} size - number of bytes(default 32)
 * @returns {string} hex token

export function generateVerificationToken(size = 32){
    return crypto.randomBytes(size).toString('hex');
}

export async function sendVerificationEmail(email,token) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port : process.env.SMTP_PORT,
        auth : {
            user : process.env.SMTP_USER,
            pass : process.env.SMTP_PASS,
        },
    });

    const verificationUrl = `${process.env.APP_URL}/api/auth/teacher/verify-email?email=${email}&token=${token}`;

    await transporter.sendMail({
        from: '"Quiz App" <no-reply@quizapp.com>',
        to: email,
        subject: 'Verify your email',
        html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email. Expires in 24 hours.</p>`,
    });
}

**/