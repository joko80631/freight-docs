import Handlebars from 'handlebars';

/**
 * Render an email template with the provided data
 * @param template Template string with Handlebars syntax
 * @param data Data object to use for rendering
 * @returns Rendered template string
 */
export function renderEmailTemplate(
  template: string,
  data: Record<string, any>
): string {
  try {
    // Compile the template
    const compiledTemplate = Handlebars.compile(template);
    
    // Render the template with the data
    return compiledTemplate(data);
  } catch (error) {
    console.error('Error rendering email template:', error);
    throw new Error('Failed to render email template');
  }
}

/**
 * Register custom Handlebars helpers
 */
export function registerTemplateHelpers(): void {
  // Format date helper
  Handlebars.registerHelper('formatDate', function(date: string | Date, format: string) {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return d.toLocaleDateString('en-US', options);
  });
  
  // Pluralize helper
  Handlebars.registerHelper('pluralize', function(count: number, singular: string, plural: string) {
    return count === 1 ? singular : plural;
  });
  
  // Truncate helper
  Handlebars.registerHelper('truncate', function(str: string, length: number) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  });
  
  // Uppercase helper
  Handlebars.registerHelper('uppercase', function(str: string) {
    if (!str) return '';
    return str.toUpperCase();
  });
  
  // Lowercase helper
  Handlebars.registerHelper('lowercase', function(str: string) {
    if (!str) return '';
    return str.toLowerCase();
  });
}

// Register helpers when the module is imported
registerTemplateHelpers(); 