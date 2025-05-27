/**
 * Formats a date into a readable format
 * 
 * Examples:
 * - Just now (less than 1 minute ago)
 * - 5 minutes ago
 * - 2 hours ago
 * - Yesterday at 2:30 PM
 * - May 25 at 3:45 PM
 * - May 25, 2024 at 3:45 PM (if not current year)
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Just now - less than 1 minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  // Minutes ago - less than 1 hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Hours ago - less than 24 hours
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Format the time part (e.g., "3:45 PM")
  const timeFormatted = date.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  // Yesterday - less than 48 hours, but different calendar day
  if (diffInSeconds < 172800 && 
      date.getDate() === now.getDate() - 1 && 
      date.getMonth() === now.getMonth() && 
      date.getFullYear() === now.getFullYear()) {
    return `Yesterday at ${timeFormatted}`;
  }
  
  // Format the date part
  const isCurrentYear = date.getFullYear() === now.getFullYear();
  
  if (isCurrentYear) {
    // Same year - show month and day (e.g., "May 25 at 3:45 PM")
    const dateFormatted = date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
    return `${dateFormatted} at ${timeFormatted}`;
  } else {
    // Different year - show full date (e.g., "May 25, 2024 at 3:45 PM")
    const dateFormatted = date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${dateFormatted} at ${timeFormatted}`;
  }
}
