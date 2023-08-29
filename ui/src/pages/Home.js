import { useMemo, useState, useEffect, useContext } from "react"

import Floppy from "./../assets/save-item-1409-svgrepo-com.svg"
import Cancel from "./../assets/cancel-svgrepo-com.svg"
import Del from "./../assets/delete-1487-svgrepo-com.svg"

import AddUser from "./../assets/user-plus-svgrepo-com.svg"
import UploadCSV from "./../assets/csv-svgrepo-com.svg"
import LogOut from "./../assets/logout-svgrepo-com.svg"

import { globalContext } from "../context/GlobalContext"
import { authContext } from "../context/AuthContext"
import "./Home.css"

export default function Home() {
  const { setMessage } = useContext(globalContext)
  const { logout } = useContext(authContext)
  const abortController = useMemo(() => new AbortController(), [])
  const apiFetch = async (url, body) => {
    const response = await fetch("http://localhost:3001/" + url, {
      signal: abortController.signal,
      method: "POST",
      mode: "cors",
      body: JSON.stringify(body),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
    const json = await response.json()
    return json
  }

  const add = async (body) => {
    const response = await apiFetch("addone", body)
    console.log(response)
    if (response.error) {
      setMessage({
        text: response.error,
        type: "error",
        buttons: ["OK"],
        actions: [
          () => {
            setMessage(null)
          },
        ],
      })
    } else {
      if (response.id) {
        let clone = table
        clone.map((item) => {
          if (item.username === body.username) {
            item.id = response.id
            delete item.edited
          }
          return item
        })
        setTable([...clone])
      } else {
        if (response.update === 1) {
          let clone = table
          clone.map((item) => {
            if (item.username === body.username) delete item.edited
            return item
          })
          setTable([...clone])
        }
      }
    }
  }

  const find = async ({ number }) => {
    const response = await apiFetch("findone/" + number, {})
    return response
  }

  const findbyid = async ({ id }) => {
    const response = await apiFetch("findonebyid/" + id, {})
    return response
  }

  const save = async (id) => {}

  const del = async ({ id, i }) => {
    if (!id) {
      // console.log(username)
      if (i) {
        let clone = table
        clone.splice(i, 1)
        setTable([...clone])
      }
    } else {
      const response = await apiFetch("delone/" + id, {})
      if (response.deleted) {
        let clone = table
        clone.map((item, i) => {
          if (item.id === id) {
            clone.splice(i, 1)
          }
        })
        console.log(clone)
        setTable([...clone])
      }
    }
  }

  const [table, setTable] = useState([])

  const fillTable = async () => {
    let newTable = table
    newTable = table
    for (let i = 0; i < 1000; i++) {
      let res = await find({ number: i })
      if (res.error) break
      newTable[i] = await res
    }
    setTable([...newTable])
  }

  useEffect(() => {
    fillTable()
  }, [])

  const [file, setFile] = useState()

  const fileReader = new FileReader()

  return (
    <div className="HomeContainer">
      <div className="HomeWindow">
        <div
          style={{
            boxShadow: "0px 0px 5px #333333",
            padding: "15px",
            marginBottom: "15px",
          }}>
          <img
            style={{ height: "50px" }}
            onClick={() => {
              let clone = table
              clone.push({
                username: "",
                email: "",
                first_name: "",
                last_name: "",
                has_password: "false",
                edited: true,
              })
              setTable([...clone])
            }}
            src={AddUser}
            className="HomeWindowImg"
          />
          <input
            onChange={async (e) => {
              e.preventDefault()
              if (e.target.files[0]) {
                fileReader.onload = (e) => {
                  const csvOutput = e.target.result.split("\n")
                  csvOutput.map((row, i) => {
                    if (i > 0) {
                      const values = row.split(",")
                      let clone = table
                      clone.push({
                        username: values[0],
                        email: values[1],
                        first_name: values[2],
                        last_name: values[3],
                        has_password: "false",
                        edited: true,
                      })
                      setTable([...clone])
                    }
                  })
                }
                fileReader.readAsText(e.target.files[0])
              }
            }}
            type={"file"}
            id={"csvFinInput"}
            accept={".csv"}
            style={{ display: "none" }}></input>
          <label
            onSubmit={(e) => {
              console.log("submit")
            }}
            htmlFor="csvFinInput">
            <img
              style={{ height: "50px", paddingLeft: "15px" }}
              className="HomeWindowImg"
              src={UploadCSV}
            />
          </label>
          <img
            style={{ height: "50px", paddingLeft: "15px" }}
            onClick={logout}
            src={LogOut}
            className="HomeWindowImg"
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Has Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table?.map((row, i) => {
              return (
                <tr key={i}>
                  <td>
                    <input
                      style={{ width: "100px" }}
                      onChange={(e) => {
                        let clone = table
                        clone[i]["username"] = e.target.value
                        clone[i]["edited"] = true
                        setTable([...clone])
                      }}
                      value={row.username}
                    />
                  </td>
                  <td>
                    <input
                      style={{ width: "230px" }}
                      onChange={(e) => {
                        let clone = table
                        clone[i]["email"] = e.target.value
                        clone[i]["edited"] = true
                        setTable([...clone])
                      }}
                      value={row.email}
                    />
                  </td>
                  <td>
                    <input
                      style={{ width: "100px" }}
                      onChange={(e) => {
                        let clone = table
                        clone[i]["first_name"] = e.target.value
                        clone[i]["edited"] = true
                        setTable([...clone])
                      }}
                      value={row.first_name}
                    />
                  </td>
                  <td>
                    <input
                      style={{ width: "100px" }}
                      onChange={(e) => {
                        let clone = table
                        clone[i]["last_name"] = e.target.value
                        clone[i]["edited"] = true
                        setTable([...clone])
                      }}
                      value={row.last_name}
                    />
                  </td>
                  <td onClick={() => console.log(table[i])}>
                    <input
                      style={{ width: "100px" }}
                      type={
                        row.has_password === "true" ||
                        row.has_password === "false"
                          ? "text"
                          : "password"
                      }
                      onClick={(e) => {
                        let clone = table
                        clone[i].has_password = "edited"
                        clone[i]["new_password"] = ""
                        clone[i]["edited"] = true
                        setTable([...clone])
                      }}
                      onChange={(e) => {
                        let clone = table
                        clone[i]["new_password"] = e.target.value

                        setTable([...clone])
                      }}
                      value={
                        row.has_password === "edited"
                          ? row.new_password
                          : row.has_password
                      }
                      onBlur={(e) => {
                        console.log(row.new_password)
                        if (row["edited"] && row["new_password"].length <= 4)
                          setMessage({
                            text: "Password too short",
                            type: "error",
                            buttons: ["OK"],
                            actions: [
                              () => {
                                console.log(row.new_password.length)
                                let clone = table
                                clone[i]["new_password"] = ""
                                setTable([...clone])
                                setMessage(null)
                              },
                            ],
                          })
                      }}
                    />
                  </td>
                  <td>
                    <div>
                      {row.edited && (
                        <>
                          <img
                            src={Floppy}
                            alt=""
                            onClick={() => {
                              add({ ...row })
                            }}
                          />
                          {row.id && (
                            <img
                              src={Cancel}
                              alt=""
                              onClick={async () => {
                                let response = await findbyid({ id: row.id })
                                let clone = table
                                clone.map((item, i) => {
                                  if (item.id === response.id) {
                                    clone[i] = response
                                    delete clone[i].edited
                                  }
                                })
                                console.log(clone)
                                setTable([...clone])
                              }}
                            />
                          )}
                        </>
                      )}
                      <img
                        src={Del}
                        alt=""
                        onClick={() => {
                          if (!row.id) {
                            console.log("del row")
                            del({ i })
                          } else {
                            del({ id: row.id })
                          }
                        }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
