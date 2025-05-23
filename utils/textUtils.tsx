import React, { ReactNode } from 'react';
import Link from 'next/link';
import { nip19 } from 'nostr-tools';

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

/**
 * Replace nostr:npub references with @username in content
 * @param content The text content that may contain nostr:npub references
 * @param eventTags The tags array from a Nostr event
 * @param userData Optional object containing profile data for referenced users 
 * @returns Text with replaced nostr:npub references
 */
export function replaceNostrReferences(
  content: string, 
  eventTags: string[][], 
  userData?: Record<string, { name?: string; display_name?: string; username?: string; }>
): ReactNode[] {
  if (!content) return [];
  
  // Extract all pubkey references from the event tags (p tags contain referenced pubkeys)
  const pubkeyRefs = eventTags
    .filter((tag) => tag[0] === "p")
    .map((tag) => ({ pubkey: tag[1], relay: tag.length > 2 ? tag[2] : undefined, petname: tag.length > 3 ? tag[3] : undefined }));

  // Find nostr:npub and nostr:nprofile references in the content
  const nostrRegex = /nostr:(npub1[a-z0-9]+|nprofile1[a-z0-9]+)/g;
  let lastIndex = 0;
  const result: ReactNode[] = [];
  let match;

  while ((match = nostrRegex.exec(content)) !== null) {
    const fullRef = match[0]; // nostr:npub1...
    const matchIndex = match.index;
    
    // Add text before the reference
    if (matchIndex > lastIndex) {
      result.push(content.substring(lastIndex, matchIndex));
    }
    
    try {
      // Extract the identifier (remove "nostr:" prefix)
      const nostrId = fullRef.substring(6);
      let pubkey: string;
      let profileRoute = nostrId;
      
      // Decode npub or nprofile to get the pubkey
      if (nostrId.startsWith('npub1')) {
        const { data } = nip19.decode(nostrId);
        pubkey = data as string;
      } else if (nostrId.startsWith('nprofile1')) {
        const { data } = nip19.decode(nostrId);
        pubkey = (data as { pubkey: string }).pubkey;
        // Still use the nprofile as the route to preserve relay information
        profileRoute = nostrId;
      } else {
        throw new Error('Unsupported nostr ID type');
      }
      
      // Find if we have any profile data for this pubkey
      const pubkeyData = pubkeyRefs.find(ref => ref.pubkey === pubkey);
      const displayName = pubkeyData?.petname || 
                          (userData && userData[pubkey] && 
                           (userData[pubkey].username || 
                            userData[pubkey].display_name || 
                            userData[pubkey].name)) || 
                          nostrId.substring(0, 8) + '...';
      
      // Create a link for the user reference
      result.push(
        <Link href={`/profile/${profileRoute}`} key={`${nostrId}-${matchIndex}`} className="text-blue-500 hover:underline">
          @{displayName}
        </Link>
      );
    } catch (error) {
      // If there's an error parsing the npub, just include it as-is
      result.push(fullRef);
    }
    
    lastIndex = matchIndex + fullRef.length;
  }
  
  // Add any remaining text
  if (lastIndex < content.length) {
    result.push(content.substring(lastIndex));
  }
  
  return result;
}

/**
 * Combines hashtag and nostr reference handling in one function
 * @param content The text content to process
 * @param eventTags The tags array from a Nostr event
 * @param userData Optional object containing profile data for referenced users
 * @returns Processed content with links
 */
export function renderTextWithLinks(
  content: string, 
  eventTags: string[][], 
  userData?: Record<string, { name?: string; display_name?: string; username?: string; }>
): ReactNode[] {
  if (!content) return [];
  
  // First replace hashtags
  const withHashtags = renderTextWithLinkedTags(content, eventTags);
  
  // Then handle nostr references for each text segment
  const result: ReactNode[] = [];
  
  for (const item of withHashtags) {
    if (typeof item === 'string' && (item.includes('nostr:npub') || item.includes('nostr:nprofile'))) {
      const withReferences = replaceNostrReferences(item, eventTags, userData);
      result.push(...withReferences);
    } else {
      result.push(item);
    }
  }
  
  return result;
}
