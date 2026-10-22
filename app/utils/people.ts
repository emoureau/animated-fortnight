import type { DataColor } from '#shared/types/user'

/**
 * Tailwind classes for each person data color (docs/design-rules.md), spelled out in full so
 * Tailwind generates them. Labels on a person fill are always text-data-label (steel-900).
 */
export const personClasses: Record<DataColor, { fill: string, border: string, tint: string, underline: string, text: string }> = {
  'person-1': { fill: 'bg-person-1', border: 'border-person-1', tint: 'bg-person-1/30', underline: 'decoration-person-1', text: 'text-person-1-text' },
  'person-2': { fill: 'bg-person-2', border: 'border-person-2', tint: 'bg-person-2/30', underline: 'decoration-person-2', text: 'text-person-2-text' },
  'person-3': { fill: 'bg-person-3', border: 'border-person-3', tint: 'bg-person-3/30', underline: 'decoration-person-3', text: 'text-person-3-text' },
  'person-4': { fill: 'bg-person-4', border: 'border-person-4', tint: 'bg-person-4/30', underline: 'decoration-person-4', text: 'text-person-4-text' },
}
