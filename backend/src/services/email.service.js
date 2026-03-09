import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Welcome email (existing)
export const sendWelcomeEmail = async (email, name) => {
    const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Welcome to Our Service',
        text: `Hello ${name}, welcome to our service! We're glad to have you on board.`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome, ${name}! 🎉</h2>
                <p>Thanks for joining our Chat Application.</p>
                <p>Click below to start chatting:</p>
                <a href="${process.env.FRONTEND_URL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to App</a>
            </div>`,
    };
    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

// Verification email (F11)
export const sendVerificationEmail = async (email, name, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Verify Your Email',
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hello, ${name}!</h2>
                <p>Please verify your email address by clicking the button below:</p>
                <a href="${verifyUrl}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 16px 0;">Verify Email</a>
                <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
            </div>`,
    };
    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

// Password reset email (F12)
export const sendPasswordResetEmail = async (email, name, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Reset Your Password',
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hello, ${name}!</h2>
                <p>You requested a password reset. Click the button below to set a new password:</p>
                <a href="${resetUrl}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 16px 0;">Reset Password</a>
                <p style="color: #666; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
            </div>`,
    };
    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
};

// Default export for backward compatibility
export default sendWelcomeEmail;
