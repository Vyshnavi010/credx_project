import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendEmailParams {
  to: string;
  auditId: string;
  savingsMonthly: number;
  savingsAnnual: number;
}

export async function sendAuditConfirmationEmail(params: SendEmailParams) {
  const { to, auditId, savingsMonthly, savingsAnnual } = params;
  const auditUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/audit/${auditId}`;

  const subject = `Your AI Spend Audit Report - Save $${savingsMonthly.toLocaleString()}/mo`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; rounded: 8px;">
      <h2 style="color: #4f46e5; margin-bottom: 10px;">Credex AI Spend Audit</h2>
      <p>Thank you for auditing your AI software spend. We have analyzed your setup and compiled your report.</p>
      
      <div style="background-color: #f4f4f5; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
        <span style="font-size: 14px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">Potential Monthly Savings</span>
        <h1 style="margin: 5px 0 0 0; color: #16a34a; font-size: 36px;">$${savingsMonthly.toLocaleString()} / mo</h1>
        <p style="margin: 5px 0 0 0; color: #71717a; font-size: 14px;">That is <strong>$${savingsAnnual.toLocaleString()}</strong> in annual savings!</p>
      </div>

      <p style="margin-bottom: 25px;">You can view your complete breakdown, recommended downgrade plans, and alternatives using the link below:</p>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${auditUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Full Audit Report</a>
      </div>

      ${savingsMonthly >= 500 ? `
        <div style="border-left: 4px solid #f59e0b; padding-left: 15px; margin-bottom: 25px;">
          <p style="margin: 0; font-weight: bold; color: #b45309;">💡 High Savings Opportunity Detected</p>
          <p style="margin: 5px 0 0 0; color: #4b5563;">Your audit qualifies for a custom consultation. A Credex advisor will reach out to help you secure discounted licenses through our partner startup pools.</p>
        </div>
      ` : ""}

      <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
      <p style="font-size: 12px; color: #a1a1aa; text-align: center;">Powered by Credex • Sourcing discounted AI infrastructure credits.</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: "Credex Audit <audits@credex.rocks>",
        to,
        subject,
        html,
      });
      console.log(`Successfully sent email to ${to} via Resend.`);
    } catch (err) {
      console.error("Resend delivery failed:", err);
    }
  } else {
    console.log("=== Transactional Email Log (No API Key) ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link: ${auditUrl}`);
    console.log("============================================");
  }
}
