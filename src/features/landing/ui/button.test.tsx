import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Componente Button UI Reutilizable', () => {
  it('debe renderizarse con estilo y variante por defecto (default, full rounded)', () => {
    render(<Button>Comenzar</Button>)
    const btn = screen.getByRole('button', { name: /comenzar/i })
    expect(btn).toBeDefined()
    expect(btn.className).toContain('rounded-full')
    expect(btn.getAttribute('data-variant')).toBe('default')
  })

  it('debe renderizar la variante outline correctamente', () => {
    render(<Button variant="outline">Cancelar</Button>)
    const btn = screen.getByRole('button', { name: /cancelar/i })
    expect(btn.getAttribute('data-variant')).toBe('outline')
    expect(btn.className).toContain('border-border')
  })

  it('debe renderizar la variante destructive correctamente', () => {
    render(<Button variant="destructive">Eliminar</Button>)
    const btn = screen.getByRole('button', { name: /eliminar/i })
    expect(btn.getAttribute('data-variant')).toBe('destructive')
    expect(btn.className).toContain('bg-destructive')
  })

  it('debe renderizar la variante warning correctamente', () => {
    render(<Button variant="warning">Precaución</Button>)
    const btn = screen.getByRole('button', { name: /precaución/i })
    expect(btn.getAttribute('data-variant')).toBe('warning')
    expect(btn.className).toContain('bg-pastel-amber')
  })

  it('debe renderizar la variante link correctamente', () => {
    render(<Button variant="link">Ver términos</Button>)
    const btn = screen.getByRole('button', { name: /ver términos/i })
    expect(btn.getAttribute('data-variant')).toBe('link')
    expect(btn.className).toContain('hover:underline')
  })

  it('debe soportar diferentes tamaños y responder a eventos onClick', () => {
    const handleClick = vi.fn()
    render(
      <Button size="xl" onClick={handleClick}>
        Continuar
      </Button>
    )
    const btn = screen.getByRole('button', { name: /continuar/i })
    expect(btn.getAttribute('data-size')).toBe('xl')
    fireEvent.click(btn)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
