import { EmailTemplate } from '../templates/types';

export class EmailDeduplication {
  private recentEmails: Map<string, number> = new Map();
  private readonly DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  private generateKey(template: EmailTemplate): string {
    return `${template.to}:${template.type}:${template.subject}`;
  }

  async isDuplicate(template: EmailTemplate): Promise<boolean> {
    const key = this.generateKey(template);
    const lastSent = this.recentEmails.get(key);
    const now = Date.now();

    if (lastSent && now - lastSent < this.DEDUP_WINDOW_MS) {
      return true;
    }

    this.recentEmails.set(key, now);
    return false;
  }

  clearHistory(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.recentEmails.entries()) {
      if (now - timestamp > this.DEDUP_WINDOW_MS) {
        this.recentEmails.delete(key);
      }
    }
  }
} 