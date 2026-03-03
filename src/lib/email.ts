import 'server-only'
import nodemailer from 'nodemailer'

type TransporterResult = {
  transporter: nodemailer.Transporter
  previewUrl?: string
}

let cachedTransporter: nodemailer.Transporter | null = null

async function getTransporter(): Promise<TransporterResult> {
  if (cachedTransporter) return { transporter: cachedTransporter }

  // If SMTP credentials are configured, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    return { transporter: cachedTransporter }
  }

  // Fallback: use Ethereal for local development
  const testAccount = await nodemailer.createTestAccount()
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  console.log('\n📬 Ethereal Email account created for development:')
  console.log(`   User: ${testAccount.user}`)
  console.log(`   Pass: ${testAccount.pass}`)
  console.log(`   View emails at: https://ethereal.email\n`)

  return { transporter: cachedTransporter, previewUrl: 'https://ethereal.email' }
}

interface ReportNotificationData {
  title: string
  category: string
  createdAt: Date
  isAnonymous: boolean
}

export async function sendNewReportNotification(
  managerEmail: string,
  managerName: string,
  companyName: string,
  report: ReportNotificationData
): Promise<void> {
  const { transporter } = await getTransporter()

  const dashboardUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/dashboard/reports`
  const from = process.env.SMTP_FROM || 'BridgeIn <noreply@bridgein.app>'

  const categoryLabels: Record<string, string> = {
    financial_misconduct: 'Financial misconduct or fraud',
    safety_violation: 'Health and safety violation',
    discrimination: 'Discrimination or harassment',
    data_breach: 'Data protection breach',
    corruption: 'Corruption or bribery',
    environmental: 'Environmental violation',
    other: 'Other',
  }

  const categoryLabel = categoryLabels[report.category] ?? report.category

  const info = await transporter.sendMail({
    from,
    to: managerEmail,
    subject: `New report submitted — ${report.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#F7F6F3;font-family:system-ui,sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <div style="background:#0E1C2F;padding:24px 32px;">
              <p style="margin:0;color:#1A6B5A;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">BridgeIn</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">New report received</h1>
            </div>

            <div style="padding:32px;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Hello ${managerName}, a new report has been submitted to your ${companyName} portal.
              </p>

              <div style="background:#F7F6F3;border-radius:8px;padding:20px;margin-bottom:24px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;color:#6B7280;font-size:13px;font-weight:500;width:120px;">Title</td>
                    <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${report.title}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#6B7280;font-size:13px;font-weight:500;">Category</td>
                    <td style="padding:8px 0;color:#111827;font-size:14px;">${categoryLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#6B7280;font-size:13px;font-weight:500;">Submitted</td>
                    <td style="padding:8px 0;color:#111827;font-size:14px;">${report.createdAt.toLocaleString('en-GB')}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#6B7280;font-size:13px;font-weight:500;">Identity</td>
                    <td style="padding:8px 0;color:#111827;font-size:14px;">${report.isAnonymous ? 'Anonymous' : 'Contact details provided'}</td>
                  </tr>
                </table>
              </div>

              <a href="${dashboardUrl}"
                 style="display:inline-block;background:#1A6B5A;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
                View in Dashboard
              </a>

              <p style="margin:32px 0 0;color:#9CA3AF;font-size:12px;line-height:1.6;">
                This is an automated notification from BridgeIn. The contents of this report are confidential
                and should only be shared on a need-to-know basis. Do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  })

  if (process.env.NODE_ENV === 'development') {
    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) {
      console.log(`\n📧 Email preview: ${previewUrl}\n`)
    }
  }
}
