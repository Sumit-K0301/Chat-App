import sgMail from '@sendgrid/mail';

const sendEmail = async (email, name) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Welcome to Our Service',
        text: `Hello ${name}, welcome to our service! We're glad to have you on board.`,
        html: 
                `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome, ${name}! 🎉</h2>
                    <p>Thanks for joining our Chat Application.</p>
                    <p>Click below to start chatting:</p>
                    <a href=${process.env.FRONTEND_URL} style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to App</a>
                </div>`,
    }

    try {
        await sgMail.send(msg);
        console.log('Welcome email sent to', email);
    } catch (error) {
        console.error('Error sending email:', error);
    }

}

export default sendEmail;