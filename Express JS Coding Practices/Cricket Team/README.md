# Cricket Team

Given two files `app.js` and a database file `cricketTeam.db` consisting a table `cricket_team`.

Write APIs to perform operations on the table `cricket_team` containing the following columns,

| Columns       | Type    |
| ------------- | ------- |
| player_id     | INTEGER |
| player_name   | TEXT    |
| jersey_number | INTEGER |
| role          | TEXT    |

### API 1

#### Path: `/players/`

#### Method: `GET`

#### Description:

Returns a list of all players in the team

#### Response

```
[
  {
    playerId: 1,
    playerName: "Lakshman",
    jerseyNumber: 5,
    role: "All-rounder"
  },

  ...
]
```

### API 2

#### Path: `/players/`

#### Method: `POST`

#### Description:

Creates a new player in the team (database). `player_id` is auto-incremented

#### Request

```
{
  "playerName": "Vishal",
  "jerseyNumber": 17,
  "role": "Bowler"
}
```

#### Response

```
Player Added to Team
```

### API 3

#### Path: `/players/:playerId/`

#### Method: `GET`

#### Description:

Returns a player based on a player ID

#### Response

```
{
  playerId: 1,
  playerName: "Lakshman",
  jerseyNumber: 5,
  role: "All-rounder"
}
```

### API 4

#### Path: `/players/:playerId/`

#### Method: `PUT`

#### Description:

Updates the details of a player in the team (database) based on the player ID

#### Request

```
{
  "playerName": "Maneesh",
  "jerseyNumber": 54,
  "role": "All-rounder"
}
```

#### Response

```
Player Details Updated

```

### API 5

#### Path: `/players/:playerId/`

#### Method: `DELETE`

#### Description:

Deletes a player from the team (database) based on the player ID

#### Response

```
Player Removed
```

<br/>

Use `npm install` to install the packages.

**Export the express instance using the default export syntax.**

**Use Common JS module syntax.**
