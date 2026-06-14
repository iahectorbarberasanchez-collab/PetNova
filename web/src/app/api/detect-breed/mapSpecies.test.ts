import { describe, it, expect } from 'vitest'
import { mapSpecies } from './route'

describe('mapSpecies()', () => {
  it('debería mapear variaciones de perros correctamente a "Dog"', () => {
    expect(mapSpecies('perro')).toBe('Dog')
    expect(mapSpecies('CAN')).toBe('Dog')
    expect(mapSpecies('un perro mestizo')).toBe('Dog')
  })

  it('debería mapear variaciones de gatos correctamente a "Cat"', () => {
    expect(mapSpecies('gato')).toBe('Cat')
    expect(mapSpecies('felino')).toBe('Cat')
    expect(mapSpecies('GATO PERSA')).toBe('Cat')
  })

  it('debería mapear otras especies conocidas', () => {
    expect(mapSpecies('pájaro')).toBe('Bird')
    expect(mapSpecies('conejo')).toBe('Rabbit')
    expect(mapSpecies('reptil')).toBe('Reptile')
    expect(mapSpecies('pez dorado')).toBe('Fish')
  })

  it('debería devolver "Other" para especies no reconocidas', () => {
    expect(mapSpecies('dragón de komodo')).toBe('Other')
    expect(mapSpecies('unicornio mágico')).toBe('Other')
    expect(mapSpecies('')).toBe('Other')
  })
})
