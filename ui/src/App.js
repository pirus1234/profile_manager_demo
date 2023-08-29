import { useContext } from "react"

import { authContext } from "./context/AuthContext"
import { globalContext } from "./context/GlobalContext"
import Message from "./components/Message"

import Home from "./pages/Home"
import Login from "./pages/Login"

import "./App.css"

function App() {
  const { user, loading } = useContext(authContext)
  const { message } = useContext(globalContext)

  return (
    <div className="App">
      {loading ? <></> : !user ? <Login /> : <Home />}
      {message && <Message {...message} />}
    </div>
  )
}

export default App
