import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Counter from '@/app/ui/counter'

describe('Counter', () => {
  it('should display initial count of 0', () => {
    render(<Counter />)
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument()
  })

  it('should increment count when increment button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', { name: /increment/i })
    await user.click(incrementButton)

    expect(screen.getByText(/count: 1/i)).toBeInTheDocument()
  })

  it('should decrement count when decrement button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', { name: /increment/i })
    const decrementButton = screen.getByRole('button', { name: /decrement/i })

    // Increment first
    await user.click(incrementButton)
    expect(screen.getByText(/count: 1/i)).toBeInTheDocument()

    // Then decrement
    await user.click(decrementButton)
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument()
  })

  it('should reset count and history when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', { name: /increment/i })
    const resetButton = screen.getByRole('button', { name: /reset/i })

    // Increment a few times
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)

    expect(screen.getByText(/count: 3/i)).toBeInTheDocument()
    expect(screen.getByText(/history/i)).toBeInTheDocument()

    // Reset
    await user.click(resetButton)

    expect(screen.getByText(/count: 0/i)).toBeInTheDocument()
    expect(screen.queryByText(/history/i)).not.toBeInTheDocument()
  })

  it('should update history when count changes', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', { name: /increment/i })

    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)

    // Check history is displayed
    const historySection = screen.getByText(/history/i).closest('div')
    expect(historySection).toBeInTheDocument()

    // Check history items
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should handle multiple rapid clicks', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', { name: /increment/i })

    // Click multiple times rapidly
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)

    expect(screen.getByText(/count: 5/i)).toBeInTheDocument()
  })
})