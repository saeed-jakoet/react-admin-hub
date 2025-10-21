// Returns the HTML for the Drop Cable Access Request email
export function getDropCableEmailHtml({
  proposedDate = "15 October 2025",
  proposedTime = "09:00 - 17:00",
  dropTeamDetails = "Team A: John Doe, Jane Smith"
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <div style="padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #264C92 0%, #1a3b73 100%); padding: 24px; text-align: center;">
          <img src="https://res.cloudinary.com/di3tech8i/image/upload/v1760287427/logo_t75170.png" alt="Fiber Africa" style="height: 60px; display: block; margin: 0 auto;" />
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">Drop Cable Access Request</h2>
          
          <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Good Morning,<br/><br/>
            Please arrange access for our drop cable installation team and provide:
          </p>

          <!-- Quick Info List -->
          <div style="background: #f1f5f9; border-left: 3px solid #264C92; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">1. Does the client have a cabinet?</p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">2. Is there power available inside the cabinet?</p>
            <p style="margin: 0; font-size: 14px; color: #334155;">3. Please share an onsite contact person.</p>
          </div>

          <!-- Details Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px; background: #f8fafc; border-radius: 6px 0 0 6px; font-size: 13px; color: #64748b; font-weight: 600; width: 40%;">Date</td>
              <td style="padding: 12px; background: #f8fafc; border-radius: 0 6px 6px 0; font-size: 15px; color: #0f172a; font-weight: 600;">${proposedDate}</td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
              <td style="padding: 12px; background: #f8fafc; border-radius: 6px 0 0 6px; font-size: 13px; color: #64748b; font-weight: 600;">Time</td>
              <td style="padding: 12px; background: #f8fafc; border-radius: 0 6px 6px 0; font-size: 15px; color: #0f172a; font-weight: 600;">${proposedTime}</td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
              <td style="padding: 12px; background: #f8fafc; border-radius: 6px 0 0 6px; font-size: 13px; color: #64748b; font-weight: 600;">Team</td>
              <td style="padding: 12px; background: #f8fafc; border-radius: 0 6px 6px 0; font-size: 15px; color: #0f172a; font-weight: 600;">${dropTeamDetails}</td>
            </tr>
          </table>

          <!-- Signature -->
          <p style="margin: 0; font-size: 15px; color: #334155;">Kind Regards,<br/><strong style="color: #264C92;">Fiber Africa</strong></p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; font-style: italic;">
            "So then faith comes by hearing, and hearing by the word of God." - Romans 10:17
          </p>
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #0f172a; font-weight: 600;">The Hub, 2 Engen Ave, Montague Gardens</p>
          <a href="https://www.fiberafrica.co.za" target="_blank" style="font-size: 13px; color: #264C92; text-decoration: none; font-weight: 600;">www.fiberafrica.co.za</a>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}