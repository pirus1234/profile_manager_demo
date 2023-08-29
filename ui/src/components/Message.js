import { useContext, useEffect } from "react"

import { globalContext } from "../context/GlobalContext"

import "./Message.css"

export default function Message() {
  const { message, setMessage } = useContext(globalContext)

  const textStyle = {
    error: {
      color: "#b30000",
    },
  }

  const windowStyle = {
    error: {
      backgroundColor: "#eee",
    },
  }

  const buttonStyle = {
    error: {
      backgroundColor: "#b30000",
      color: "#fff",
    },
  }

  useEffect(() => {
    console.log(message)
  }, [message])

  // text: json.error,
  // type: "error",
  // buttons: ["OK"],
  // actions: [() => setMessage(false)],

  return (
    <div className="MessageContainer">
      <div className="MessageWindow" style={windowStyle[message.type]}>
        <div style={textStyle[message.type]}>{message?.text}</div>
        <div style={{}}>
          {message?.buttons?.map((button, i) => {
            return (
              <div
                key={i}
                className="MessageButton"
                style={{ ...buttonStyle[message.type] }}
                onClick={message.actions[i]}>
                {button}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
