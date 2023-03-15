const nodemailer = require("nodemailer");

module.exports = async (options) => {
  const configOptions = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
  const transporter = nodemailer.createTransport(configOptions);

  // Mail options
  const mailOptions = {
    from: "Bouncy Elegance <olawale@hello.com>",
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
};
