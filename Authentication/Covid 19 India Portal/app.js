const express = require('express')
const app = express()
app.use(express.json())
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const dbPath = path.join(__dirname, 'covid19IndiaPortal.db')
let db = null
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('The server is running at hrrp://localhost:3000/')
    })
  } catch (e) {
    console.log(`Db Error : ${e.message}`)
    process.exit(1)
  }
}
initializeDatabaseAndServer()

const convertstateDbObjtoresponseObj = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  }
}

const convertDistrictDbObjecttoResposneObj = dbObject => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  }
}
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers['authorization']
  if (authHeader === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
    return
  }
  const jwtToken = authHeader.split(' ')[1]
  if (jwtToken === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
    return
  }
  jwt.verify(jwtToken, 'chakri', (error, payload) => {
    if (error) {
      response.status(401)
      response.send('Invalid JWT Token')
      return
    } else {
      next()
    }
  })
}


app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}';`
  const dbuser = await db.get(selectUserQuery)
  if (dbuser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbuser.password)
    if (isPasswordMatched == true) {
      const payload = {
        username: username,
      }
      const jwtToken = jwt.sign(payload, 'chakri')
      response.send({jwtToken})
      // response.send('Login Successfull')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

app.get('/states/', authenticateToken, async (request, response) => {
  const getStatesQuery = `
  SELECT * FROM state ORDER BY state_id;
  `
  const statesArray = await db.all(getStatesQuery)
  response.send(
    statesArray.map(eachState => convertstateDbObjtoresponseObj(eachState)),
  )
})

app.get('/states/:stateId/', authenticateToken, async (request, resposne) => {
  const {stateId} = request.params
  const getBoookQuery = `
  SELECT * FROM state WHERE state_id = '${stateId}';
  `
  const state = await db.get(getBoookQuery)
  resposne.send(convertstateDbObjtoresponseObj(state))
})

app.post('/districts', authenticateToken, async (request, response) => {
  try {
    const {districtName, stateId, cases, cured, active, deaths} = request.body
    const insertdistrictQuery = `
      INSERT INTO district (district_name, state_id, cases, cured, active, deaths)
      VALUES ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths})
    `
    const dbResponse = await db.run(insertdistrictQuery)
    const district_id = dbResponse.lastID
    response.send('District Successfully Added')
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    response.status(500).send({error: 'Internal Server Error'})
  }
})

app.get(
  '/districts/:districtId/',
  authenticateToken,
  async (request, response) => {
    const {districtId} = request.params
    const getDistrictQuery = `
  SELECT * FROM district WHERE district_id='${districtId}';
  `
    const district = await db.get(getDistrictQuery)
    response.send(convertDistrictDbObjecttoResposneObj(district))
  },
)

app.delete(
  '/districts/:districtId/',
  authenticateToken,
  async (request, response) => {
    const {districtId} = request.params
    const deleteDistrictQuery = `
    DELETE FROM district WHERE  district_id='${districtId}';
    `
    const dbresponse = await db.run(deleteDistrictQuery)
    response.send('District Removed')
  },
)

app.put(
  '/districts/:districtId/',
  authenticateToken,
  async (request, response) => {
    const {districtId} = request.params
    const {districtName, stateId, cases, cured, active, deaths} = request.body
    const updateDetailsQuery = `
  UPDATE district SET district_name='${districtName}',
  state_id=${stateId},
  cases=${cases},
  cured=${cured},
  active=${active},
  deaths=${deaths}
  WHERE district_id = ${districtId};
  `
    const dbresponse = await db.run(updateDetailsQuery)
    response.send('District Details Updated')
  },
)

app.get('/states/:stateId/stats', authenticateToken, async (req, res) => {
  const {stateId} = req.params
  const api8 = `SELECT SUM(cases) AS totalCases,SUM(cured) AS totalCured,SUM(active) AS totalActive,SUM(deaths) AS totalDeaths FROM district WHERE state_id = '${stateId}';`
  const ans = await db.get(api8)
  res.send(ans)
})
module.exports = app
