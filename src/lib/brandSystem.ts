/**
 * Master Brand System v3.0 — Terminology Constants
 *
 * Implements the "Two Roads" strategy with distinct terminologies:
 * - Atlas (The Field Journal): Additive/Designed — "Journey" metaphors
 * - Relic (The Vault): Subtractive/Found — "Artifact" metaphors
 */

export type CollectionType = 'atlas' | 'relic';

// ============================================================================
// COLLECTION-LEVEL LABELS
// ============================================================================

export const COLLECTION_LABELS = {
  atlas: {
    name: 'The Atlas',
    concept: 'The Field Journal',
    philosophy: 'Additive/Designed',
    context: 'A memory stabilized in oil.',
    itemSingular: 'Waypoint',
    itemPlural: 'Waypoints',
    classLabel: 'Composition',
    coordinateLabel: 'Inspiration Point',
    coordinateDescription: 'The memory or atmosphere this scent captures.',
  },
  relic: {
    name: 'The Relic',
    concept: 'The Vault',
    philosophy: 'Subtractive/Found',
    context: 'A material preserved in time.',
    itemSingular: 'Specimen',
    itemPlural: 'Specimens',
    classLabel: 'Single Origin Specimen',
    coordinateLabel: 'Provenance',
    coordinateDescription: 'The exact harvest site of the material.',
    // Heritage Distillation overrides
    heritageClassLabel: 'Heritage Distillation',
    heritageCoordinateLabel: 'Distillery (The Kiln)',
    heritageCoordinateDescription: 'The location where the artifact was born.',
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the singular or plural item label for a collection.
 * Atlas: "Waypoint" / "Waypoints"
 * Relic: "Specimen" / "Specimens"
 */
export function getItemLabel(
  collectionType: CollectionType,
  count: number = 1
): string {
  const labels = COLLECTION_LABELS[collectionType];
  return count === 1 ? labels.itemSingular : labels.itemPlural;
}

/**
 * Get the "Class" label for product headers.
 * Atlas: "Composition"
 * Relic (Standard): "Single Origin Specimen"
 * Relic (Heritage): "Heritage Distillation"
 */
export function getClassLabel(
  collectionType: CollectionType,
  isHeritageDistillation: boolean = false
): string {
  if (collectionType === 'relic' && isHeritageDistillation) {
    return COLLECTION_LABELS.relic.heritageClassLabel;
  }
  return COLLECTION_LABELS[collectionType].classLabel;
}

/**
 * Get the semantic label for GPS coordinates.
 * Atlas: "Inspiration Point"
 * Relic (Standard): "Provenance"
 * Relic (Heritage): "Distillery (The Kiln)"
 */
export function getCoordinateLabel(
  collectionType: CollectionType,
  isHeritageDistillation: boolean = false
): string {
  if (collectionType === 'relic' && isHeritageDistillation) {
    return COLLECTION_LABELS.relic.heritageCoordinateLabel;
  }
  return COLLECTION_LABELS[collectionType].coordinateLabel;
}

/**
 * Get the coordinate description for tooltips or schema help text.
 */
export function getCoordinateDescription(
  collectionType: CollectionType,
  isHeritageDistillation: boolean = false
): string {
  if (collectionType === 'relic' && isHeritageDistillation) {
    return COLLECTION_LABELS.relic.heritageCoordinateDescription;
  }
  return COLLECTION_LABELS[collectionType].coordinateDescription;
}
