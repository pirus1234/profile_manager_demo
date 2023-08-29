import {
  useMemo,
  useState,
  useCallback,
  memo,
  useRef,
  useEffect,
  useContext,
} from "react"

import UserLogo from "../assets/profile-round-1342-svgrepo-com.svg"

import { globalContext } from "../context/GlobalContext"
import { authContext } from "../context/AuthContext"

import "./Login.css"

export default memo(function Login() {
  const containerRef = useRef(null)

  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)

  const { setMessage } = useContext(globalContext)
  const { authorize } = useContext(authContext)

  // Abort cotroller
  const abortController = useMemo(() => new AbortController(), [])

  useEffect(() => {
    containerRef.current.style.transform = "scale(1)" // animation
    containerRef.current.style.opacity = 1 // animation
    return () => {
      abortController.abort() // aborts any pending http reqs when unmounting component
    }
  }, [abortController])

  const Login = useCallback(
    async (e, userName, password, remember) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        // **** Error handling ***
        if (userName.length < 4) {
          throw Error("Username too short")
        }
        if (password.length < 4) {
          throw Error("Password too short")
        }
        // ***********************
        const response = await fetch("http://localhost:3001/login", {
          signal: abortController.signal,
          method: "POST",
          mode: "cors",
          body: JSON.stringify({
            credentials: btoa(`${userName}:${password}:${remember}`),
          }),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })
        const json = await response.json()
        if (json.error) {
          setMessage({
            text: json.error,
            type: "error",
            buttons: ["OK"],
            actions: [() => setMessage(null)],
          })
        }
        if (json.username && json.remember) authorize()
      } catch (e) {
        setMessage({
          text: e.message,
          type: "error",
          buttons: ["OK"],
          actions: [() => setMessage(null)],
        })
      }
    },
    [abortController.signal]
  )

  return (
    <div ref={containerRef} className="LoginContainer">
      <div className="LoginWindow">
        <div className="LoginWindowUserLoginHeader">
          <h1>USER LOGIN</h1>
        </div>
        <div className="LoginWindowSmallHeader">
          <span>Profile Management App</span>
        </div>
        <div className="LoginWindowUserPassword">
          <div>
            <div className="LoginWindowUserPasswordImgContainer">
              <img src={UserLogo} alt="" />
            </div>
          </div>
          <div>
            {useMemo(() => {
              return (
                <label>
                  <input
                    tabIndex={1}
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="true"
                    type="text"
                    placeholder=""
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                  <span>username</span>
                </label>
              )
            }, [userName])}
            {useMemo(() => {
              return (
                <label>
                  <input
                    tabIndex={2}
                    type="password"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) =>
                      e.key === "Enter" &&
                      Login(e, userName, password, remember)
                    }
                  />
                  <span>password</span>
                </label>
              )
            }, [password])}
          </div>
          <div>
            {useMemo(() => {
              return (
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={() => setRemember(!remember)}
                    />
                    <div></div>
                  </label>
                  <span tabIndex={3} onClick={() => setRemember(!remember)}>
                    Remember me
                  </span>
                </div>
              )
            }, [remember])}
            <div>
              <div></div>
              <span
                onClick={(e) => {
                  Login(e, userName, password, remember) // Fire function with current states
                }}>
                Login
              </span>
            </div>
          </div>
        </div>
        <div className="LoginWindowSmallHeader">
          <span>Forgot password?</span>
        </div>
        <div className="LoginWindowUserLoginHeader">
          <h1>
            <br />
          </h1>
        </div>
      </div>
    </div>
  )
})
