/**
 * Basic setup test to verify Jest configuration
 */

describe('Test Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true)
  })

  it('should have access to environment variables', () => {
    expect(process.env.NEXT_PUBLIC_API_URL).toBe('http://localhost:8000/api')
  })
})
