/**
 * PromptShift Sovereign Transactional Email Templates
 * Responsive, dark-mode aligned, cyber-security branded HTML templates.
 */

export class EmailTemplates {
  private static baseLayout(title: string, bodyContent: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f17;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 32px 20px;
    }
    .card {
      background: #111827;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 36px 32px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    }
    .header {
      margin-bottom: 28px;
      text-align: center;
    }
    .brand {
      font-size: 22px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
      text-decoration: none;
    }
    .brand-accent {
      color: #06b6d4;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 9999px;
      background: rgba(6, 182, 212, 0.15);
      color: #22d3ee;
      border: 1px solid rgba(6, 182, 212, 0.3);
      margin-top: 10px;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 18px 0;
    }
    .button-container {
      text-align: center;
      margin: 28px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      font-size: 13px;
      font-weight: 800;
      color: #000000 !important;
      background: linear-gradient(135deg, #06b6d4, #10b981);
      border-radius: 10px;
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.35);
    }
    .box {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 18px 20px;
      margin: 20px 0;
    }
    .box-title {
      font-size: 12px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 6px;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #64748b;
      margin-top: 28px;
      line-height: 1.5;
    }
    .footer a {
      color: #06b6d4;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <a href="https://promptshift.dev" class="brand">Prompt<span class="brand-accent">Shift</span>.dev</a>
      <div><span class="badge">ZERO SERVER RETENTION • SOVEREIGN AI BRIDGE</span></div>
    </div>
    <div class="card">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>PromptShift.dev — Sovereign AI Coding Assistant Converter<br>
      Strict In-RAM Processing • No Cloud Databases • Zero Tracking Cookies</p>
      <p>Need support? Contact <a href="mailto:support@promptshift.dev">support@promptshift.dev</a> | SOC-2: <a href="mailto:compliance@promptshift.dev">compliance@promptshift.dev</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  public static welcomeAccount(email: string): { subject: string; html: string } {
    const title = 'Welcome to PromptShift — Your Sovereign AI Workspace';
    const body = `
      <h1>Account Created Successfully</h1>
      <p>Welcome to <strong>PromptShift.dev</strong>, the sovereign, zero-retention bridge for AI coding assistants (Gemini, Claude, Cursor, and OpenAI).</p>
      
      <div class="box">
        <div class="box-title">🔒 Sovereign Security Guarantee:</div>
        <p style="margin: 0; font-size: 12px;">Your master password was salted and hashed client-side with SHA-256 via the Web Crypto API. We do not store your credentials on any central database.</p>
      </div>

      <p>You can now log into your Customer Portal from any browser to manage your past conversions, view sovereign VAT receipts, and manage your developer passes.</p>

      <div class="button-container">
        <a href="https://promptshift.dev" class="button">Open Sovereign Converter →</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 0;">Registered account email: <strong>${email}</strong></p>
    `;

    return {
      subject: 'Welcome to PromptShift — Sovereign AI Agent Workspace',
      html: this.baseLayout(title, body),
    };
  }

  public static proPassActivated(email: string, projectName: string, fileCount?: number): { subject: string; html: string } {
    const title = 'Your Free Pro Pass is Active — PromptShift';
    const countText = fileCount ? `${fileCount} files` : 'Complete repository';
    const body = `
      <h1>⚡ Free Pro Pass Activated!</h1>
      <p>Your early adopter <strong>Founding Developer Pro Pass</strong> has been successfully credited to your email.</p>
      
      <div class="box">
        <div class="box-title">📦 Project Transpilation Details:</div>
        <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
          <strong>Project:</strong> ${projectName}<br>
          <strong>Scope:</strong> ${countText}<br>
          <strong>Status:</strong> 98.5% Verified Semantic Parity<br>
          <strong>Cost:</strong> 0.00 € (Complimentary during Open Beta)
        </p>
      </div>

      <p>You have unrestricted, full repository access across all 4 ecosystems: <strong>Anthropic Claude, OpenAI Custom GPT, Cursor, and Google Gemini</strong>.</p>

      <div class="button-container">
        <a href="https://promptshift.dev" class="button">Go to PromptShift.dev →</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 0;">Activated for developer: <strong>${email}</strong></p>
    `;

    return {
      subject: `⚡ Free Pro Pass Active: ${projectName} converted on PromptShift`,
      html: this.baseLayout(title, body),
    };
  }

  public static orderCompleted(
    email: string,
    planName: string,
    amount: string,
    currency: string,
    orderId: string
  ): { subject: string; html: string } {
    const title = 'Payment Confirmed & License Active — PromptShift';
    const body = `
      <h1>⚡ Payment Confirmed!</h1>
      <p>Thank you for purchasing <strong>${planName}</strong> on PromptShift via Polar.sh Merchant of Record.</p>
      
      <div class="box">
        <div class="box-title">💳 Order & License Confirmation:</div>
        <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
          <strong>Plan:</strong> ${planName}<br>
          <strong>Total Paid:</strong> ${amount} ${currency}<br>
          <strong>Order ID:</strong> ${orderId}<br>
          <strong>Payment Processor:</strong> Polar.sh (Apple Pay, Google Pay, Cards, SEPA)<br>
          <strong>Architecture:</strong> Sovereign Vault • Zero Server Retention
        </p>
      </div>

      <p>Your license pass has been activated. You can convert unlimited AI projects with verified 98.5% semantic AST parity and zero server data retention.</p>

      <div class="button-container">
        <a href="https://promptshift.dev" class="button">Access PromptShift Converter →</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 0;">Receipt sent to: <strong>${email}</strong></p>
    `;

    return {
      subject: `⚡ Payment Confirmed: ${planName} active on PromptShift (${orderId})`,
      html: this.baseLayout(title, body),
    };
  }
}

