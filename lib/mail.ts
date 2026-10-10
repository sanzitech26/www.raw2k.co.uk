import nodemailer from 'nodemailer'

// Gmail SMTP via App Password. ponytail: no queue/retry; the enquiry is stored first so nothing is lost if this fails.
export async function sendMail(o: { to: string; subject: string; text: string; replyTo?: string }) {
  const { GMAIL_USER: user, GMAIL_APP_PASSWORD: pass } = process.env
  if (!user || !pass || !o.to) return false
  await nodemailer.createTransport({ service: 'gmail', auth: { user, pass } }).sendMail({ from: `RAW2K Website <${user}>`, ...o })
  return true
}
