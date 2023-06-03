const nodemailer = require("nodemailer");
const pug = require("pug");
const path = require("path");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url, post = null) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.url = url;
    this.from = `Akin-Odanye Elizabeth <${process.env.EMAIL_FROM}>`;
    this.post = post;
  }

  newTransport() {
    if (process.env.NODE_ENV == "production") {
      // use a different transport
      return nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: process.env.BREVO_PORT,
        auth: {
          user: process.env.BREVO_USERNAME,
          pass: process.env.BREVO_PASSWORD,
        },
      });
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
        post: this.post,
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
  async sendNewPostUpdate() {
    let about = `New Blog Post: ${this.post.title}`;
    await this.sendEmail("new-post", about);
  }
  async sendPasswordReset() {
    await this.sendEmail(
      "password-reset",
      "Password reset request (Expires in 10mins)"
    );
  }
  async sendWriterRevoked() {
    await this.sendEmail("writer-revoked", "You're no longer a writer");
  }
  async sendWriterAccepted() {
    await this.sendEmail("writer-accepted", "You are now a writer");
  }
};
