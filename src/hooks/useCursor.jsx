import { useState } from 'react'
/**
 * Set cursor style.
*/
export const useCursor = () => {
  const [cursor, setCursor] = useState('auto')
  const setCursorStyle = (style) => {
    setCursor(style)
    document.body.style.cursor = style
  }
  return [cursor, setCursorStyle]
}
