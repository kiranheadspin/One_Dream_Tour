export const NEW_LEAD_BATCH_SIZE = 3;

export interface BatchLead {
  id: string;
  createdAt: string;
  hasInteraction: boolean;
}

/**
 * The New batch is intentionally derived, not stored: it always contains the
 * three newest enquiries, except for enquiries that operations has already
 * interacted with. This keeps the queue current without changing a lead's
 * actual pipeline stage.
 */
export function getNewLeadIds(leads: readonly BatchLead[]) {
  return new Set(
    [...leads]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, NEW_LEAD_BATCH_SIZE)
      .filter((lead) => !lead.hasInteraction)
      .map((lead) => lead.id),
  );
}
