import { createContext, useState, useEffect } from "react"

export const globalContext = createContext(null)

export default function GlobalContext({ children }) {
  const [message, setMessage] = useState(null)

  // useEffect(() => {
  //   console.log(message)
  // }, message)

  return (
    <globalContext.Provider value={{ message, setMessage }}>
      {children}
    </globalContext.Provider>
  )
}
