import type { NostrEvent } from '@nostrify/nostrify';
import { PictureCard } from './PictureCard';
import { MinimalPictureCard } from './MinimalPictureCard';
import { useAppContext } from '@/hooks/useAppContext';

interface AdaptivePictureCardProps {
  event: NostrEvent;
}

/**
 * A smart component that renders either PictureCard or MinimalPictureCard
 * based on the user's preferMinimalCards setting in AppContext.
 * 
 * This allows for consistent card rendering across the app without 
 * needing to manually check the preference in every component.
 */
export function AdaptivePictureCard({ event }: AdaptivePictureCardProps) {
  const { config } = useAppContext();

  if (config.preferMinimalCards) {
    return <MinimalPictureCard event={event} />;
  }

  return <PictureCard event={event} />;
}
