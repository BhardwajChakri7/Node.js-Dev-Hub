# Movies

Given two files `app.js` and a database file `moviesData.db` consisting of two tables `movie` and `director`.

Write APIs to perform CRUD operations on the tables `movie`, `director` containing the following columns,

**Movie Table**

| Columns     | Type    |
| ----------- | ------- |
| movie_id    | INTEGER |
| director_id | INTEGER |
| movie_name  | TEXT    |
| lead_actor  | TEXT    |

**Director Table**

| Columns       | Type    |
| ------------- | ------- |
| director_id   | INTEGER |
| director_name | TEXT    |

### API 1

#### Path: `/movies/`

#### Method: `GET`

#### Description:

Returns a list of all movie names in the movie table

#### Response

```
[
  {
    movieName: "Captain America: The First Avenger",
  },

  ...
]
```

### API 2

#### Path: `/movies/`

#### Method: `POST`

#### Description:

Creates a new movie in the movie table. `movie_id` is auto-incremented

#### Request

```
{
  "directorId": 6,
  "movieName": "Jurassic Park",
  "leadActor": "Jeff Goldblum"
}
```

#### Response

```
Movie Successfully Added
```

### API 3

#### Path: `/movies/:movieId/`

#### Method: `GET`

#### Description:

Returns a movie based on the movie ID

#### Response

```
{
  movieId: 12,
  directorId: 3,
  movieName: "The Lord of the Rings",
  leadActor: "Elijah Wood",
}
```

### API 4

#### Path: `/movies/:movieId/`

#### Method: `PUT`

#### Description:

Updates the details of a movie in the movie table based on the movie ID

#### Request

```
{
  "directorId": 24,
  "movieName": "Thor",
  "leadActor": "Christopher Hemsworth"
}
```

#### Response

```
Movie Details Updated

```

### API 5

#### Path: `/movies/:movieId/`

#### Method: `DELETE`

#### Description:

Deletes a movie from the movie table based on the movie ID

#### Response

```
Movie Removed
```

### API 6

#### Path: `/directors/`

#### Method: `GET`

#### Description:

Returns a list of all directors in the director table

#### Response

```
[
  {
    directorId: 1,
    directorName: "Joe Johnston",
  },

  ...
]
```

### API 7

#### Path: `/directors/:directorId/movies/`

#### Method: `GET`

#### Description:

Returns a list of all movie names directed by a specific director

#### Response

```
[
  {
    movieName: "Captain Marvel",
  },

  ...
]
```

<br/>

Use `npm install` to install the packages.

**Export the express instance using the default export syntax.**

**Use Common JS module syntax.**
