'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'

/**
 * input/textarea с suppressHydrationWarning.
 * Расширения (Surfshark data-sharkid, Grammarly и т.д.) дописывают атрибуты в поля до гидратации React.
 */
export const HydrationSafeInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  function HydrationSafeInput(props, ref) {
    return <input ref={ref} {...props} suppressHydrationWarning />
  },
)

export const HydrationSafeTextarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<'textarea'>>(
  function HydrationSafeTextarea(props, ref) {
    return <textarea ref={ref} {...props} suppressHydrationWarning />
  },
)
