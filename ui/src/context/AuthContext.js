import { createContext, useState, useMemo, useEffect } from "react"

export const authContext = createContext(null)

export default function AuthContext({ children }) {
  const [user, setUser] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const abortController = useMemo(() => new AbortController(), [])

  const authorize = async () => {
    setLoading(true)
    const response = await fetch("http://localhost:3001/auth", {
      signal: abortController.signal,
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
    const json = await response.json()
    if (response.status === 200 && json.username && json.remember) {
      setUser(json.username)
      setRemember(json.remember === true ? true : false)
    }
    setLoading(false)
  }

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:3001/logout", {
        signal: abortController.signal,
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      await response.json()
      console.log("asd")
      setUser("")
    } catch (e) {}
  }

  useEffect(() => {
    return () => {
      if (remember === false) logout()
    }
  }, [remember])

  useEffect(() => {
    authorize()
  }, [])

  return (
    <authContext.Provider value={{ authorize, user, setUser, loading, logout }}>
      {children}
    </authContext.Provider>
  )
}
