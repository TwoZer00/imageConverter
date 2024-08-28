import { useState } from 'react'
/*
custom hook get css cursor value and set cursor style
*/
export const useCursor = () => {
  const [cursor, setCursor] = useState('auto')
  const setCursorStyle = (style) => {
    setCursor(style)
    document.body.style.cursor = style
  }
  return [cursor, setCursorStyle]
}
