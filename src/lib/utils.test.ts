import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  cn,
  formatDate,
  formatRelativeTime,
  getStatusConfig,
  getCategoryLabel,
  getInitials,
  REPORT_CATEGORIES,
} from './utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('px-2', 'px-4')).toBe('px-4') // tailwind-merge deduplication
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'excluded', 'included')).toBe('base included')
  })
})

describe('formatDate', () => {
  it('formats a date object', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date)
    expect(result).toContain('2024')
    expect(result).toContain('Jan')
  })

  it('formats an ISO string', () => {
    const result = formatDate('2024-06-01')
    expect(result).toContain('2024')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-06-01T12:00:00Z'))
  })

  it('returns "just now" for very recent times', () => {
    expect(formatRelativeTime(new Date('2024-06-01T11:59:30Z'))).toBe('just now')
  })

  it('returns minutes for recent times', () => {
    expect(formatRelativeTime(new Date('2024-06-01T11:55:00Z'))).toBe('5m ago')
  })

  it('returns hours for same-day times', () => {
    expect(formatRelativeTime(new Date('2024-06-01T10:00:00Z'))).toBe('2h ago')
  })

  it('returns days for recent dates', () => {
    expect(formatRelativeTime(new Date('2024-05-30T12:00:00Z'))).toBe('2d ago')
  })
})

describe('getStatusConfig', () => {
  it('returns the correct label for each status', () => {
    expect(getStatusConfig('new').label).toBe('New')
    expect(getStatusConfig('reviewing').label).toBe('In Review')
    expect(getStatusConfig('resolved').label).toBe('Resolved')
    expect(getStatusConfig('closed').label).toBe('Closed')
  })

  it('returns closed config for unknown status', () => {
    expect(getStatusConfig('unknown' as never).label).toBe('Closed')
  })

  it('includes a className for each status', () => {
    for (const status of ['new', 'reviewing', 'resolved', 'closed'] as const) {
      expect(getStatusConfig(status).className.length).toBeGreaterThan(0)
    }
  })
})

describe('getCategoryLabel', () => {
  it('returns the human-readable label for known categories', () => {
    expect(getCategoryLabel('financial_misconduct')).toBe('Financial misconduct or fraud')
    expect(getCategoryLabel('safety_violation')).toBe('Health and safety violation')
    expect(getCategoryLabel('discrimination')).toBe('Discrimination or harassment')
    expect(getCategoryLabel('other')).toBe('Other')
  })

  it('returns the raw value for unknown categories', () => {
    expect(getCategoryLabel('some_unknown_category')).toBe('some_unknown_category')
  })
})

describe('getInitials', () => {
  it('returns initials for a two-word name', () => {
    expect(getInitials('Jane Smith')).toBe('JS')
  })

  it('returns initials for a three-word name', () => {
    expect(getInitials('Jane Anne Smith')).toBe('JA')
  })

  it('handles a single-word name', () => {
    expect(getInitials('Jane')).toBe('J')
  })
})

describe('REPORT_CATEGORIES', () => {
  it('has at least 5 categories', () => {
    expect(REPORT_CATEGORIES.length).toBeGreaterThanOrEqual(5)
  })

  it('each category has a non-empty value and label', () => {
    for (const cat of REPORT_CATEGORIES) {
      expect(cat.value.length).toBeGreaterThan(0)
      expect(cat.label.length).toBeGreaterThan(0)
    }
  })
})
