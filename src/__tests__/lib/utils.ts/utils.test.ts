import { isValidEmail, formatUserName } from '@/app/lib/utils'

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('invalid@.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('formatUserName', () => {
  it('should format user names correctly', () => {
    expect(formatUserName('John Doe')).toBe('john-doe')
    expect(formatUserName('  Jane Smith  ')).toBe('jane-smith')
    expect(formatUserName('Mary   Jane Watson')).toBe('mary-jane-watson')
  })
})