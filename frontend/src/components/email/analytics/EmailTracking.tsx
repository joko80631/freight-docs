import { useEffect } from 'react';
import { trackEmailOpen, trackEmailClick } from '@/lib/email/services/analytics';

interface EmailTrackingProps {
  emailId: string;
  userId: string;
  templateId: string;
  templateName: string;
}

export function EmailTracking({
  emailId,
  userId,
  templateId,
  templateName,
}: EmailTrackingProps) {
  useEffect(() => {
    // Track email open when the component mounts
    const trackOpen = async () => {
      try {
        await trackEmailOpen(
          emailId,
          userId,
          undefined, // ipAddress
          navigator.userAgent,
          {
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          undefined // locationInfo
        );
      } catch (error) {
        console.error('Failed to track email open:', error);
      }
    };

    trackOpen();
  }, [emailId, userId, templateId, templateName]);

  const handleLinkClick = async (linkId: string) => {
    try {
      await trackEmailClick(
        linkId,
        userId,
        undefined, // ipAddress
        navigator.userAgent,
        {
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        undefined // locationInfo
      );
    } catch (error) {
      console.error('Failed to track link click:', error);
    }
  };

  return null; // This component doesn't render anything
} 