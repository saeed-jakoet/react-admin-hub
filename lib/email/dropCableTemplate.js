// Returns the HTML for the Drop Cable Access Request email
export function getDropCableEmailHtml({
  proposedDate = "15 October 2025",
  proposedTime = "09:00 - 17:00",
  dropTeamDetails = "Team A: John Doe, Jane Smith"
}) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #1f2937; background: #ffffff; padding: 0; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Logo Header -->
      <div style="padding: 48px 32px 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
        <img src="https://res.cloudinary.com/di3tech8i/image/upload/v1760287427/logo_t75170.png" alt="Fiber CRM Logo" style="height: 80px; display: block; margin: 0 auto;" />
      </div>
      <!-- Content -->
      <div style="padding: 40px 32px;">
        <h2 style="margin: 0 0 32px 0; font-size: 22px; font-weight: 600; color: #111827;">Drop Cable Access Request</h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">Good Morning,</p>
        <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.6; color: #374151;">
          Please assist with arranging access for the following drop cable team for a drop cable installation.
        </p>
        <!-- Information Required -->
        <div style="margin: 0 0 32px 0;">
          <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #111827;">Could you please provide us with the following information:</p>
          <ol style="padding-left: 20px; margin: 0; line-height: 1.8;">
            <li style="margin-bottom: 8px; color: #374151; font-size: 15px;">Does the client have a cabinet?</li>
            <li style="margin-bottom: 8px; color: #374151; font-size: 15px;">Is there power available inside the cabinet?</li>
            <li style="margin-bottom: 0; color: #374151; font-size: 15px;">Please share an onsite contact person.</li>
          </ol>
        </div>
        <!-- Appointment Details -->
        <div style="margin: 0 0 32px 0; padding: 24px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">PROPOSED DATE</p>
          <p style="margin: 0 0 24px 0; font-size: 16px; color: #111827;">${proposedDate}</p>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">PROPOSED TIME</p>
          <p style="margin: 0 0 24px 0; font-size: 16px; color: #111827;">${proposedTime}</p>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">DROP TEAM DETAILS</p>
          <p style="margin: 0; font-size: 16px; color: #111827;">${dropTeamDetails}</p>
        </div>
        <!-- Signature -->
        <p style="margin: 0 0 4px 0; font-size: 15px; color: #374151;">Kind Regards,</p>
        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">Fiber Africa</p>
      </div>
      <!-- Footer -->
      <div style="padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; font-style: italic; line-height: 1.5;">
          "So then faith comes by hearing, and hearing by the word of God."<br/>
          Romans 10:17
        </p>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
          Keep God first and He will take you places you've never dreamt of.
        </p>
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #111827; font-weight: 600;">The Hub</p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
          2 Engen Ave. Montague Gardens, Cape Town
        </p>
        <a href="https://www.fiberafrica.co.za" target="_blank" style="font-size: 14px; color: #111827; text-decoration: none;">
          www.fiberafrica.co.za
        </a>
        <p style="margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
          This is an automated message from Fiber CRM. Please do not reply directly to this email.
        </p>
      </div>
    </div>
  </div>
  `;
}
