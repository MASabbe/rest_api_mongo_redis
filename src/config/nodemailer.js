import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import {smtpConfig} from './vars';

const readHTMLFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, {encoding: 'utf-8'}, function(err, html) {
      if (err) {
        reject(err);
      }
      resolve(html);
    });
  });
};
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: smtpConfig.email,
    pass: smtpConfig.password,
  },
});
const send = async (to, subject, text, template) => {
  const mail = await transporter.sendMail({
    from: 'customer service', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: template, // html body

  });
  return mail.messageId;
};
export const sendCompleteRegister = async (data) => {
  const {email, username, referral, code} = data;
  const template = await readHTMLFile(path.join(__dirname, '../api/services/completeRegistration.html')).then((html)=>{
    return handlebars.compile(html);
  });
  const replacements = {
    referral: referral,
    username: username,
    code: code,
  };
  const html = template(replacements);
  return await send(email, 'Welcome', 'Congratulations, registration complete', html);
};
export const sendResetPassword = async (data) => {
  const {email, username, password} = data;
  const template = await readHTMLFile(path.join(__dirname, '../api/services/resetPassword.html')).then((html)=>{
    return handlebars.compile(html);
  });
  const replacements = {
    username: username,
    password: password,
  };
  const html = template(replacements);
  return await send(email, 'Authentication', 'Reset password', html);
};
