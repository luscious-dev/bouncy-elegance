const nodemailer = require("nodemailer");
const pug = require("pug");
const path = require("path");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.url = url;
    this.from = `Akin-Odanye Elizabeth <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV == "production") {
      // use a different transport
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(template, subject) {
    const html = pug.renderFile(
      path.join(__dirname, `../views/emails/${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.htmlToText(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.sendEmail("welcome", "Welcome to BouncyElegance");
  }
};

// module.exports = async (options) => {
//   const configOptions = {
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   };
//   const transporter = nodemailer.createTransport(configOptions);

//   // Mail options
//   const mailOptions = {
//     from: "Bouncy Elegance <olawale@hello.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.text,
//   };

//   await transporter.sendMail(mailOptions);
// };
