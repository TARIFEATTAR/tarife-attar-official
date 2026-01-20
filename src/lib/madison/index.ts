/**
 * Madison Studio exports
 * 
 * ghostWriter provides functions for Madison Studio to push content to Sanity:
 * - pushDraft: Push product drafts (Atlas/Relic collections)
 * - pushJournalEntry: Push journal/blog entry drafts
 */

export {
  pushDraft,
  pushJournalEntry,
  pushFieldJournal,
  type MadisonPayload,
  type JournalPayload,
  type FieldJournalPayload,
} from './ghostWriter';
