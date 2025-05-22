import React, { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Renders text content with hyperlinked hashtags
 * @param content The text content that may contain hashtags
 * @param eventTags The tags array from a Nostr event
 * @returns An array of text and link elements
 */
export function renderTextWithLinkedTags(content: string, eventTags: string[][]): ReactNode[] {
  if (!content) return [];
  
  // Extract all hashtags from the event tags
  const eventHashtags = eventTags
    .filter((tag) => tag[0] === "t")
    .map((tag) => tag[1].toLowerCase());
  
  // Find hashtags in the content with regex
  const hashtagRegex = /#(\w+)/g;
  let lastIndex = 0;
  const result: ReactNode[] = [];
  let match;

  while ((match = hashtagRegex.exec(content)) !== null) {
    const hashtag = match[1].toLowerCase();
    const fullHashtag = match[0]; // #hashtag
    const matchIndex = match.index;
    
    // Add text before the hashtag
    if (matchIndex > lastIndex) {
      result.push(content.substring(lastIndex, matchIndex));
    }
    
    // Check if this hashtag exists in the event tags
    if (eventHashtags.includes(hashtag)) {
      // Create a link for matching hashtags
      result.push(
        <Link href={`/tag/${hashtag}`} key={`${hashtag}-${matchIndex}`} className="text-blue-500 hover:underline">
          {fullHashtag}
        </Link>
      );
    } else {
      // Add the hashtag without a link if it's not in the tags
      result.push(fullHashtag);
    }
    
    lastIndex = matchIndex + fullHashtag.length;
  }
  
  // Add any remaining text
  if (lastIndex < content.length) {
    result.push(content.substring(lastIndex));
  }
  
  return result;
}
