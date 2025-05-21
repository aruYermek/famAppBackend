
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    console.log(`📩 Попытка отправить email на: ${to}`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Убедитесь, что .env заполнен
        pass: process.env.EMAIL_PASS, // Используйте пароль приложения (App Password)
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email успешно отправлен');
  } catch (error) {
    console.error('❌ Ошибка при отправке email:', error);
    throw error; // Пробрасываем ошибку, чтобы ее увидел контроллер
  }
};

module.exports = sendEmail;
