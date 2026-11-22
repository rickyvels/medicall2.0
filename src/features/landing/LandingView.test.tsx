import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LandingView } from './LandingView'

const assign = vi.fn()
vi.stubGlobal('location', { ...window.location, assign })

describe('LandingView (Landing Medicall - Consultas Rápidas y Recetas)', () => {
  it('debe renderizar el logo, propuesta de valor, consulta en vivo y tarifas', () => {
    render(
      <LandingView />
    )

    const logos = screen.getAllByAltText('Medicall Logo')
    expect(logos.length).toBeGreaterThan(0)
    expect(
      screen.getByText('¿Te sientes mal? Consulta a un médico al instante y obtén tu receta')
    ).toBeDefined()
    expect(screen.getByText('¿Cómo funciona una consulta en Medicall?')).toBeDefined()
    expect(screen.getAllByText('Disponibilidad Offline').length).toBeGreaterThan(0)
    expect(screen.getByText('Recetas Digitales Validadas')).toBeDefined()
    expect(screen.getByText('Tarifas Transparentes')).toBeDefined()
    expect(screen.getByText('Preguntas Frecuentes')).toBeDefined()
  })

  it('debe navegar a la ruta /app cuando se presiona el botón de consulta o comenzar', () => {
    render(
      <LandingView />
    )

    const startButton = screen.getByTestId('start-button')
    fireEvent.click(startButton)

    expect(assign).toHaveBeenCalledWith('/app')
  })
})
