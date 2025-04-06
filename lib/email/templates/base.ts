/**
 * Base email template with consistent styling and structure
 */

// Company branding information
const BRANDING = {
  name: 'Freight Document Platform',
  logo: 'https://yourdomain.com/logo.png', // Replace with actual logo URL
  primaryColor: '#2563eb', // Blue
  secondaryColor: '#f3f4f6', // Light gray
  textColor: '#1f2937', // Dark gray
  fontFamily: 'Arial, sans-serif',
};

/**
 * Generate the base HTML structure for all email templates
 * @param content The main content of the email
 * @param title The title of the email
 * @param preheader Optional preheader text for email clients
 * @param unsubscribeUrl Optional unsubscribe URL
 * @returns Complete HTML email
 */
export function generateBaseTemplate(
  content: string,
  title: string,
  preheader?: string,
  unsubscribeUrl?: string
): string {
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
      <p>© ${new Date().getFullYear()} ${BRANDING.name}. All rights reserved.</p>
      ${unsubscribeUrl ? `
        <div class="unsubscribe">
          <p>You received this email because you're subscribed to updates from ${BRANDING.name}.</p>
          <p><a href="${unsubscribeUrl}">Unsubscribe</a> or <a href="https://yourdomain.com/preferences">manage preferences</a></p>
        </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `.trim();
}

export interface BaseTemplateProps {
  content: string;
  title?: string;
  unsubscribeUrl?: string;
}

export function baseTemplate({
  content,
  title = 'Freight Document Platform',
  unsubscribeUrl,
}: BaseTemplateProps): string {
  const year = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
          .unsubscribe {
            margin-top: 15px;
            font-size: 12px;
            color: #999;
          }
          a {
            color: #0070f3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="Logo" class="logo">
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <p>&copy; ${year} ${process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
          ${unsubscribeUrl ? `
            <div class="unsubscribe">
              You received this email because you are subscribed to notifications from ${process.env.NEXT_PUBLIC_APP_NAME}.
              <br>
              <a href="${unsubscribeUrl}">Unsubscribe</a>
            </div>
          ` : ''}
        </div>
      </body>
    </html>
  `.trim();
} 