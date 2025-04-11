export class EmailPreferences {
  private unsubscribed: Set<string> = new Set();

  async isUnsubscribed(email: string): Promise<boolean> {
    return this.unsubscribed.has(email);
  }

  async unsubscribe(email: string): Promise<void> {
    this.unsubscribed.add(email);
  }

  async resubscribe(email: string): Promise<void> {
    this.unsubscribed.delete(email);
  }
} 