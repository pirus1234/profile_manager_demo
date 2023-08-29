/*
  API running port 3001 default
  Starting api server creates user/pass admin/admin in mongodb://127.0.0.1:27017/profile_manager
  Modify as you wish.
  Still todo : Password update function non-existant
*/

const express = require("express")
var cors = require("cors")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const port = 3001
const bcrypt = require("bcrypt")
var jwt = require("jsonwebtoken")
jwtKey = "nUIg8&/GOiboui(GE(p=#C¤YP)(N#Y)P(¤WN%VYP)(WQVNG"

app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

const hashedPassword = async (password) => {
  return await bcrypt.hash(password, 13)
}

const mongoose = require("mongoose")
const { Schema } = mongoose

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: false },
  first_name: { type: String, required: false },
  last_name: { type: String, required: false },
  password: { type: String, required: false },
})

const mongo = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/profile_manager", {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  })
  const user = mongoose.model("user", userSchema)
  await user.deleteOne({ username: "admin" })
  await user.create({
    username: "admin",
    email: "admin",
    password: await hashedPassword("admin"),
  })
}
main()

async function main() {
  try {
    mongo()
  } catch (e) {
    console.log("db error")
    console.log(e)
  }
}

const auth = async (req, res, next) => {
  try {
    token = req.cookies?.token
    const decoded = jwt.verify(token, jwtKey)
    if (decoded) {
      next()
    } else {
      res.json({ error: "Not Authorized" }).status(401)
      return false
    }
  } catch (e) {
    res.json({ error: "Not Authorized" }).status(401)
    return false
  }
}

app.post("/logout", async (req, res) => {
  res.clearCookie("token", { path: "/" }).json({}).status(200)
})

app.post(
  "/delone/:id",
  async (req, res, next) => await auth(req, res, next),
  async (req, res) => {
    try {
      const id = req.params.id
      const user = mongoose.model("user", userSchema)
      const del = await user.findOneAndRemove({ _id: id })
      if (del.id) {
        res.json({ deleted: true }).status(200)
      }
    } catch (e) {
      res.json({ error: e.message }).status(200)
    }
  }
)

app.post(
  "/addone",
  async (req, res, next) => await auth(req, res, next),
  async (req, res) => {
    try {
      const username = req.body.username
      const email = req.body.email
      if (username.length < 4) throw Error("Username too short")
      if (email.length < 4) throw Error("Email too short")
      const first_name = req.body.first_name
      const last_name = req.body.last_name
      const id = req.body?.id
      const user = mongoose.model("user", userSchema)
      if (!id) {
        if (await user.findOne({ username })) {
          throw Error("Username already exists")
        } else {
          if (await user.findOne({ email })) {
            throw Error("Email is already taken by another user")
          } else {
            console.log(await user.findOne({ email }))
            const add = await user.create({
              username,
              email,
              first_name,
              last_name,
            })
            res.json({ id: add.id }).status(200)
          }
        }
      } else {
        const update = await user.updateOne(
          { _id: id },
          {
            username,
            email,
            first_name,
            last_name,
          }
        )
        console.log(update)
        res.json({ update: update.modifiedCount }).status(200)
      }
      // console.log(req.body)
    } catch (e) {
      res.json({ error: e.message })
    }
  }
)

app.post(
  "/findone/:skip",
  async (req, res, next) => await auth(req, res, next),
  async (req, res) => {
    try {
      const user = mongoose.model("user", userSchema)
      let result = await user.findOne(req.body).skip(req.params.skip)

      res
        .json({
          id: result.id,
          username: result.username,
          email: result.email,
          first_name: result.first_name,
          last_name: result.last_name,
          has_password: result.password ? "true" : "false",
        })
        .status(200)
    } catch (e) {
      console.log(e)
      res.json({ error: e.message })
    }
  }
)

app.post(
  "/findonebyid/:id",
  async (req, res, next) => await auth(req, res, next),
  async (req, res) => {
    try {
      const user = mongoose.model("user", userSchema)
      let result = await user.findById(req.params.id)
      res
        .json({
          id: result.id,
          username: result.username,
          email: result.email,
          first_name: result.first_name,
          last_name: result.last_name,
          has_password: result.password ? "true" : "false",
        })
        .status(200)
    } catch (e) {
      console.log(e)
      res.json({ error: e.message })
    }
  }
)

app.post("/auth", async (req, res, next) => {
  try {
    const token = req.cookies?.token
    const decoded = jwt.verify(token, jwtKey)
    if (decoded) {
      res
        .json({ username: decoded.username, remember: decoded.remember })
        .status(200)
      next(req, res)
    }
  } catch (e) {
    res.json({}).status(401)
    return false
  }
})

app.post("/login", async (req, res) => {
  try {
    const usernameRegex = /^[a-zA-Z0-9]+$/
    const credentials = atob(req.body.credentials).split(":")
    const username = credentials[0].toLowerCase(),
      password = credentials[1],
      remember = credentials[2]
    const credentialsLength = credentials.length
    const usernameLenght = username.length
    const passwordLength = password.length

    // Error checking, input, boundries, sanity

    if (credentialsLength > 3 || credentialsLength < 3) {
      throw Error("Too many or too few values")
    }
    if (!usernameRegex.test(username)) throw Error("Username not valid")
    if (usernameLenght < 4 || usernameLenght > 20) {
      throw Error("Username too short or too long")
    }
    if (passwordLength < 4 || passwordLength > 20) {
      throw Error("Password too short or too long")
    }
    if (remember !== "true" && remember !== "false") {
      throw Error("Remember me value error")
    }

    // Check DB and Authorize if username/password match

    await mongo()
    const user = mongoose.model("user", userSchema)
    const mongoResults = await user.find({ username })
    if (mongoResults.length !== 0) {
      const authorize = await bcrypt.compare(password, mongoResults[0].password)
      if (!authorize) {
        throw Error("Username and Password does not match") // Username found, password wrong
      } else {
        const token = jwt.sign({ username, remember }, jwtKey, {
          expiresIn: "2d",
        })
        res.cookie("token", token).json({ username, remember }).status(200)
      }
    } else {
      throw Error("Username and Password does not match") // Username not found
    }
  } catch (e) {
    res.json({ error: e.message }).status(401)
  }
  // res.json({ message: "Hello World" }).status(200)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
