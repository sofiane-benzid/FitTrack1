import { createContext, useState } from 'react'

export const Context = createContext()

export const ContextProvider = ({ children }) => {
  const [state, setState] = useState(null)

  return (
    <Context.Provider value={{ state, setState }}>
      {children}
    </Context.Provider>
  )
}
