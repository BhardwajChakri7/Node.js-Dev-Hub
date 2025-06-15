const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'twitterClone.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000)
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}
initializeDBAndServer()

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  let jwtToken = authHeader?.split(' ')[1]

  if (!jwtToken) {
    res.status(401).send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', (error, payload) => {
      if (error) res.status(401).send('Invalid JWT Token')
      else {
        req.username = payload.username
        next()
      }
    })
  }
}

// Helper to get user ID
const getUserIdFromUsername = async username => {
  const user = await db.get(`SELECT user_id FROM user WHERE username = ?`, [
    username,
  ])
  return user?.user_id
}

// API 1 - Register
app.post('/register/', async (req, res) => {
  const {username, password, name, gender} = req.body
  const user = await db.get(`SELECT * FROM user WHERE username = ?`, [username])

  if (user) return res.status(400).send('User already exists')
  if (password.length < 6) return res.status(400).send('Password is too short')

  const hashedPassword = await bcrypt.hash(password, 10)
  await db.run(
    `INSERT INTO user (username, password, name, gender) VALUES (?, ?, ?, ?)`,
    [username, hashedPassword, name, gender],
  )
  res.send('User created successfully')
})

// API 2 - Login
app.post('/login/', async (req, res) => {
  const {username, password} = req.body
  const user = await db.get(`SELECT * FROM user WHERE username = ?`, [username])

  if (!user) return res.status(400).send('Invalid user')

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) return res.status(400).send('Invalid password')

  const payload = {username}
  const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN')
  res.send({jwtToken})
})

// API 3 - User Tweets Feed
app.get('/user/tweets/feed/', authenticateToken, async (req, res) => {
  const userId = await getUserIdFromUsername(req.username)
  const tweets = await db.all(
    `SELECT username, tweet, date_time as dateTime
     FROM follower JOIN tweet ON follower.following_user_id = tweet.user_id
     JOIN user ON tweet.user_id = user.user_id
     WHERE follower.follower_user_id = ?
     ORDER BY date_time DESC
     LIMIT 4`,
    [userId],
  )
  res.send(tweets)
})

// API 4 - Following
app.get('/user/following/', authenticateToken, async (req, res) => {
  const userId = await getUserIdFromUsername(req.username)
  const result = await db.all(
    `SELECT name FROM follower 
     JOIN user ON user.user_id = follower.following_user_id
     WHERE follower.follower_user_id = ?`,
    [userId],
  )
  res.send(result)
})

// API 5 - Followers
app.get('/user/followers/', authenticateToken, async (req, res) => {
  const userId = await getUserIdFromUsername(req.username)
  const result = await db.all(
    `SELECT name FROM follower 
     JOIN user ON user.user_id = follower.follower_user_id
     WHERE follower.following_user_id = ?`,
    [userId],
  )
  res.send(result)
})

// Helper: validate access to tweet
const hasAccessToTweet = async (tweetId, userId) => {
  const tweetOwner = await db.get(
    `SELECT user_id FROM tweet WHERE tweet_id = ?`,
    [tweetId],
  )
  if (!tweetOwner) return false
  const isFollower = await db.get(
    `SELECT * FROM follower 
     WHERE follower_user_id = ? AND following_user_id = ?`,
    [userId, tweetOwner.user_id],
  )
  return !!isFollower
}

// API 6 - Tweet Details
app.get('/tweets/:tweetId/', authenticateToken, async (req, res) => {
  const {tweetId} = req.params
  const userId = await getUserIdFromUsername(req.username)

  if (!(await hasAccessToTweet(tweetId, userId)))
    return res.status(401).send('Invalid Request')

  const tweetDetails = await db.get(
    `SELECT tweet, date_time as dateTime FROM tweet WHERE tweet_id = ?`,
    [tweetId],
  )
  const likes = await db.get(
    `SELECT COUNT(*) as likes FROM like WHERE tweet_id = ?`,
    [tweetId],
  )
  const replies = await db.get(
    `SELECT COUNT(*) as replies FROM reply WHERE tweet_id = ?`,
    [tweetId],
  )

  res.send({...tweetDetails, likes: likes.likes, replies: replies.replies})
})

// API 7 - Likes
app.get('/tweets/:tweetId/likes/', authenticateToken, async (req, res) => {
  const {tweetId} = req.params
  const userId = await getUserIdFromUsername(req.username)

  if (!(await hasAccessToTweet(tweetId, userId)))
    return res.status(401).send('Invalid Request')

  const users = await db.all(
    `SELECT username FROM like JOIN user ON like.user_id = user.user_id WHERE tweet_id = ?`,
    [tweetId],
  )
  res.send({likes: users.map(u => u.username)})
})

// API 8 - Replies
app.get('/tweets/:tweetId/replies/', authenticateToken, async (req, res) => {
  const {tweetId} = req.params
  const userId = await getUserIdFromUsername(req.username)

  if (!(await hasAccessToTweet(tweetId, userId)))
    return res.status(401).send('Invalid Request')

  const replies = await db.all(
    `SELECT name, reply FROM reply JOIN user ON reply.user_id = user.user_id WHERE tweet_id = ?`,
    [tweetId],
  )
  res.send({replies})
})

// API 9 - User Tweets
app.get('/user/tweets/', authenticateToken, async (req, res) => {
  const userId = await getUserIdFromUsername(req.username)

  const tweets = await db.all(
    `SELECT tweet.tweet, tweet.date_time as dateTime,
        (SELECT COUNT(*) FROM like WHERE tweet_id = tweet.tweet_id) as likes,
        (SELECT COUNT(*) FROM reply WHERE tweet_id = tweet.tweet_id) as replies
     FROM tweet WHERE user_id = ?`,
    [userId],
  )
  res.send(tweets)
})

// API 10 - Create Tweet
app.post('/user/tweets/', authenticateToken, async (req, res) => {
  const {tweet} = req.body
  const userId = await getUserIdFromUsername(req.username)

  await db.run(
    `INSERT INTO tweet (tweet, user_id, date_time) VALUES (?, ?, datetime('now'))`,
    [tweet, userId],
  )
  res.send('Created a Tweet')
})

// API 11 - Delete Tweet
app.delete('/tweets/:tweetId/', authenticateToken, async (req, res) => {
  const {tweetId} = req.params
  const userId = await getUserIdFromUsername(req.username)

  const tweet = await db.get(
    `SELECT * FROM tweet WHERE tweet_id = ? AND user_id = ?`,
    [tweetId, userId],
  )
  if (!tweet) return res.status(401).send('Invalid Request')

  await db.run(`DELETE FROM tweet WHERE tweet_id = ?`, [tweetId])
  res.send('Tweet Removed')
})

module.exports = app // Default export
