import { describe, expect, it } from 'vitest'
import { evalExpr, kpAppend } from './evalExpr'

describe('evalExpr', () => {
  it('adds and multiplies with polish comma', () => {
    expect(evalExpr('12+8*2')).toBe(28)
    expect(evalExpr('10,5+1,5')).toBe(12)
  })

  it('handles division and negatives', () => {
    expect(evalExpr('10/4')).toBe(2.5)
    expect(evalExpr('5-3-1')).toBe(1)
  })
})

describe('kpAppend', () => {
  it('clears and equals', () => {
    expect(kpAppend('1+2', '=', false)).toEqual({ expr: '3', justCalc: true })
    expect(kpAppend('99', 'C', false)).toEqual({ expr: '', justCalc: false })
  })

  it('starts new number after equals', () => {
    expect(kpAppend('12', '3', true)).toEqual({ expr: '3', justCalc: false })
  })
})
