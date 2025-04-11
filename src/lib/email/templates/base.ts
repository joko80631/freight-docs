/**
 * Base email template with consistent styling and structure
 */

// Company branding information
const BRANDING = {
  name: 'Freight Document Platform',
  logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
  primaryColor: '#2563eb', // Blue
  secondaryColor: '#f3f4f6', // Light gray
  textColor: '#1f2937', // Dark gray
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

export interface BaseTemplateProps {
  content: string;
  title?: string;
  unsubscribeUrl?: string;
}

/**
 * Generate the base HTML structure for all email templates
 */
export function baseTemplate({
  content,
  title = BRANDING.name,
  unsubscribeUrl,
}: BaseTemplateProps): string {
  const year = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <style>
    /* Reset styles for email clients */
    body, p, h1, h2, h3, h4, h5, h6, table, td {
      margin: 0;
      padding: 0;
      font-family: ${BRANDING.fontFamily};
    }
    body {
      background-color: #f9fafb;
      color: ${BRANDING.textColor};
      line-height: 1.5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .content {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      font-size: 12px;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      background-color: ${BRANDING.primaryColor};
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .unsubscribe {
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      margin-top: 20px;
    }
    .unsubscribe a {
      color: ${BRANDING.primaryColor};
      text-decoration: none;
    }
    /* Responsive styles */
    @media (max-width: 600px) {
      .container {
        padding: 10px;
      }
      .content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${BRANDING.logo}" alt="${BRANDING.name}" class="logo">
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p>© ${year} ${BRANDING.name}. All rights reserved.</p>
      ${unsubscribeUrl ? `
        <div class="unsubscribe">
          <p>You received this email because you're subscribed to updates from ${BRANDING.name}.</p>
          <p><a href="${unsubscribeUrl}">Unsubscribe</a> or <a href="${process.env.NEXT_PUBLIC_APP_URL}/preferences">manage preferences</a></p>
        </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `.trim();
} 