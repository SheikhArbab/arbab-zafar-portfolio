import nodemailer from 'nodemailer'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface Mail {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

export type MailResult = { ok: true; provider: 'gmail' | 'smtp' | 'resend' } | { ok: false; error: string }

/**
 * Sends email with whichever provider is configured (server-side env only), in this order:
 *  • Gmail:  GMAIL_USER + GMAIL_APP_PASSWORD (a Google "App password", not your login password)
 *  • SMTP:   SMTP_HOST (+ SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE)
 *  • Resend: RESEND_API_KEY (+ optional CONTACT_FROM_EMAIL)
 */
function smtpConfig() {
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  if (gmailUser && gmailPass) {
    return {
      provider: 'gmail' as const,
      from: gmailUser,
      options: { host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: gmailUser, pass: gmailPass.replace(/\s+/g, '') } },
    }
  }
  // Any other SMTP server (Outlook, Zoho, Brevo, a local mail catcher…)
  const host = process.env.SMTP_HOST
  if (host) {
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER
    return {
      provider: 'smtp' as const,
      from: process.env.SMTP_FROM || user || 'portfolio@localhost',
      options: { host, port, secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465, auth: user ? { user, pass: process.env.SMTP_PASS || '' } : undefined },
    }
  }
  return null
}

export async function sendMail(mail: Mail): Promise<MailResult> {
  try {
    const smtp = smtpConfig()
    if (smtp) {
      const transport = nodemailer.createTransport(smtp.options)
      await transport.sendMail({ from: `"Portfolio" <${smtp.from}>`, to: mail.to, replyTo: mail.replyTo, subject: mail.subject, html: mail.html, text: mail.text })
      return { ok: true, provider: smtp.provider }
    }
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
          to: [mail.to],
          reply_to: mail.replyTo,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        }),
      })
      if (!res.ok) return { ok: false, error: `Resend error ${res.status}: ${(await res.text()).slice(0, 200)}` }
      return { ok: true, provider: 'resend' }
    }
    return { ok: false, error: 'No email provider configured. Set GMAIL_USER + GMAIL_APP_PASSWORD (or SMTP_* / RESEND_API_KEY) in Netlify.' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Email failed' }
  }
}

/** Recipient for notifications: admin setting (private_settings) → CONTACT_NOTIFY_EMAIL env → none. */
export async function notificationRecipient(sb: SupabaseClient): Promise<string | null> {
  const { data } = await sb.from('private_settings').select('notify_email, notify_enabled').eq('id', 1).maybeSingle()
  if (data && data.notify_enabled === false) return null
  return data?.notify_email || process.env.CONTACT_NOTIFY_EMAIL || null
}
