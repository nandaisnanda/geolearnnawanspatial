
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { applicantName, jobTitle, applicantEmail } = await req.json()

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Send notification to admin emails
    const adminEmails = ['anandashabrinagunawan@gmail.com', 'nawanspatial@gmail.com']

    for (const adminEmail of adminEmails) {
      const emailData = {
        from: 'GeoLearn <notifications@geolearn.com>',
        to: [adminEmail],
        subject: `New Job Application: ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Job Application Received</h2>
            <p>A new job application has been submitted for the position: <strong>${jobTitle}</strong></p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Applicant Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${applicantName}</li>
                <li><strong>Email:</strong> ${applicantEmail}</li>
                <li><strong>Position:</strong> ${jobTitle}</li>
                <li><strong>Applied:</strong> ${new Date().toLocaleDateString()}</li>
              </ul>
            </div>

            <p>Please log in to your admin dashboard to review the full application details.</p>
            
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from GeoLearn.
            </p>
          </div>
        `
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        console.error(`Failed to send email to ${adminEmail}:`, await response.text())
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(JSON.stringify({ error: 'Failed to send notification' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
