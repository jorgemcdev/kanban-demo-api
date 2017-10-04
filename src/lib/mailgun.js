import config from 'config';
import logger from 'winston';

const mailgun = require('mailgun-js')(
  {
    apiKey: config.MAILGUN_PRIV_KEY,
    domain: config.MAILGUN_DOMAIN
  }
);

// Create function to send emails through Mailgun API
const sendEmail = (recipient, message) => {
  const data = {
    from: 'Your Site <info@yourdomain.com>',
    to: recipient,
    subject: message.subject,
    text: message.text
  };

  mailgun.messages().send(data, (err, body) => {
    if (err) logger.error(`Mailgun Error ${err}`);
    logger.info(`MailGun: ${body}`);
  });
};

const contactForm = (sender, message) => {
  const data = {
    from: sender,
    to: 'you@yourdomain.com',
    subject: message.subject,
    text: message.text
  };

  mailgun.messages().send(data, (err, body) => {
    if (err) logger.error(`Mailgun Error ${err}`);
    logger.info(`MailGun: ${body}`);
  });
};

export default {
  sendEmail, contactForm
};
