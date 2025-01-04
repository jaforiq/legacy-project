import express, { Express, Request, Response } from "express";
import cors from 'cors';
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Sequelize, Op } from "sequelize";
import multer from 'multer';
import path from 'path';
import sequelize from "./sequelize";
import User from "./../models/Users";
import Movie from "./../models/Movies";
import RR from "./../models/Ratings&Reviews";
import Genre from "./../models/Genre";
import MG from "./../models/MovieGenre";
// import routes from './routes/router';

// Initialize associations
Movie.hasMany(RR, { foreignKey: "movie_id", as: "ratingsReviews" });
RR.belongsTo(Movie, { foreignKey: "movie_id" });

// Define associations
Movie.hasMany(MG, { foreignKey: "movie_id" });
MG.belongsTo(Movie, { foreignKey: "movie_id" });

Genre.hasMany(MG, { foreignKey: "genre_id" });
MG.belongsTo(Genre, { foreignKey: "genre_id" });

// Add an association to include genres via MG
Movie.belongsToMany(Genre, { through: MG, foreignKey: "movie_id", as: "genres" });
Genre.belongsToMany(Movie, { through: MG, foreignKey: "genre_id" });


const app: Express = express();
const port = 3000;

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
  res.send('DB testing!');
});

app.post('/', (req: Request, res: Response) => {
  console.log(req.body);
  res.send('Got a POST request');
});


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath); // Directory to save the files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// Endpoint to upload image
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
  } else {
    res.status(200).json({
      message: 'File uploaded successfully!',
      filePath: `/uploads/${req.file.filename}`,
    });
  }
});

// Route: Insert a single user
app.post("/users", async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Route: Read a single user by ID
app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Route: Read a single user by email
app.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ where: { email: req.params.id } });
    // console.log('user :', user);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Route: Read all users
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Route: Insert a single movie
app.post("/movies", async (req: Request, res: Response) => {
  // console.log(req.body);
  const { user_id, title, img, desc, release_yr, director, length, producer, genre } = req.body;

  try {
    const transaction = await sequelize.transaction();
  
    try {
      const movie = await Movie.create(
        { user_id, title, img, desc, release_yr, director, length, producer },
        { transaction }
      );

      // console.log("Created movie:", movie);
      // console.log("Movie ID:", movie.dataValues.movie_id);

if (!movie.dataValues.movie_id) {
  throw new Error("Movie ID is null after creation");
}

const genreInstances = await Promise.all(
  genre.map(async (g: string) =>
    Genre.findOrCreate({ where: { genre: g }, transaction })
  )
);

// Mapping through the genreInstances and using genreInstance correctly
await Promise.all(
  genreInstances.map(async ([genreInstance]) =>
    MG.create(
      { movie_id: movie.dataValues.movie_id, genre_id: genreInstance.genre_id },
      { transaction }
    )
  )
);


  
      await transaction.commit();
      res.status(201).json({ message: "Movie created successfully", movie });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error during movie creation:", error);
    res.status(500).json({ error: "Failed to create movie" });
  }
});

// app.get("/movies/:id", async (req: Request, res: Response) => {
//   try {
//     const movie = await Movie.findByPk(req.params.id);
//     const rating = await RR.findAll({ where: { movie_id: movie?.dataValues.movie_id } });
//     const user = await User.findOne({ where: { user_id: movie?.dataValues.user_id } });
//     const averageRating = rating.reduce(
//       (sum, item) => sum + item.dataValues.rating,
//       0 // Initial value for sum
//     ) / rating.length;
//         // Fetch all genres associated with the movie
//         const genres = await MG.findAll({
//           where: { movie_id: movie?.dataValues.movie_id },
//           include: [
//             {
//               model: Genre,
//               attributes: ["genre"], // Fetch only the 'genre' field
//             },
//           ],
//         });
//     if (movie) {
//       res.status(200).json({
//         ...movie.dataValues, 
//         rating: averageRating, 
//         genres: genres.map(x => x.dataValues.Genre.dataValues.genre),
//         user: user?.dataValues.name,
//         rr : rating.map(async (x) => {
//           // console.log(x.dataValues.r);
//           const user = await User.findOne({ where: { user_id: x?.dataValues.user_id } });
//           // console.log(user?.dataValues.name);
//           return { user: user?.dataValues.name, review: x.dataValues.review, rating: x.dataValues.rating };
//         })
//       });
//     } else {
//       res.status(404).json({ error: "Movie not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch movie" });
//   }
// });

// Route: Read a single movie by ID
app.get("/movies/:id", async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }

    // Fetch all ratings for the movie
    const ratings = await RR.findAll({ where: { movie_id: movie.dataValues.movie_id } });

    // Fetch the user who created the movie
    const user = await User.findOne({ where: { user_id: movie.dataValues.user_id } });

    // Calculate the average rating
    const averageRating =
      ratings.reduce((sum, item) => sum + item.dataValues.rating, 0) /
      (ratings.length || 1); // Avoid division by zero

    // Fetch all genres associated with the movie
    const genres = await MG.findAll({
      where: { movie_id: movie.dataValues.movie_id },
      include: [{ model: Genre, attributes: ["genre"] }],
    });

    // Resolve reviews (rr array) with user data
    const rr = await Promise.all(
      ratings.map(async (rating) => {
        const user = await User.findOne({ where: { user_id: rating.dataValues.user_id } });
        return {
          rr_id: rating?.dataValues.rr_id,
          user_id: user?.dataValues.user_id,
          user: user?.dataValues.name,
          review: rating.dataValues.review,
          rating: rating.dataValues.rating,
        };
      })
    );

    // Respond with the movie data
    res.status(200).json({
      ...movie.dataValues,
      rating: averageRating || null, // Handle no ratings gracefully
      genres: genres.map((x) => x.dataValues.Genre?.genre || "Unknown Genre"),
      user: user?.dataValues.name || "Unknown User", // Handle missing user gracefully
      rr,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});


// Route: Update a single movie by ID
app.put(
  "/movies/:id",
  async (
    req: Request<ParamsDictionary, any, any, ParsedQs>,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params; // Get movie ID from URL
      const updatedData = req.body; // Get new data from request body

      // Find the movie by ID
      const movie = await Movie.findByPk(id);

      if (!movie) {
        // If movie not found, return 404
        res.status(404).json({ error: "Movie not found" });
        return;
      }

      // Update the movie with the new data
      await movie.update(updatedData);

      // Return the updated movie
      res.status(200).json(movie);
    } catch (error) {
      console.error("Error updating movie:", error);
      res.status(500).json({ error: "Failed to update movie" });
    }
  }
);

// Route: Delete a single movie by ID
app.delete('/movies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get movie ID from URL

    // Delete the movie by ID
    const movie = await Movie.destroy({
      where: {
        movie_id: id,
      },
    });
    const rr = await RR.destroy({
      where: {
        movie_id: id,
      },
    });
    const mg = await MG.destroy({
      where: {
        movie_id: id,
      },
    });
    // console.log(movie, rr, mg);
    // Return the deleted movie
    res.status(200).json({deleted: true});
  } catch (error) {
    console.error("Error deleting movie:", error);
    res.status(500).json({ error: "Failed to delete movie" });
  }
});

// // Define the query parameter interface
// interface MovieSearchQuery {
//   title?: string;
// }

// Route: Search for movies by title
app.get("/search", async (req: Request, res: Response) => {
  try {
    const { title } = req.query; // Get the title from query parameters
    // console.log(title);
    // res.status(200).send(title);
    const movies = await Movie.findAll({
      where: {
        title: {
          [Op.iLike]: `%${title}%`, // Case-insensitive partial match
        },
      },
      attributes: {
        include: [
          // Add the average rating as a computed field
          [
            Sequelize.fn("AVG", Sequelize.col("ratingsReviews.rating")),
            "averageRating",
          ],
        ],
      },
      include: [
        {
          model: RR,
          as: "ratingsReviews", // Match the alias defined in the associations
          attributes: [], // Do not include all RR fields in the response
        },
        {
          model: Genre,
          as: "genres", // Match the alias for the many-to-many association
          attributes: ["genre"], // Include only the genre name
          through: { attributes: [] }, // Exclude junction table fields
        },
      ],
      group: ["Movie.movie_id", "genres.genre_id"], // Group by movie ID and genre ID
    });

    if (movies.length === 0) {
      res.status(404).json({ message: "No movies found" });
    } else {
      res.status(200).json(movies);
    }
  } catch (error) {
    console.error("Error searching for movies:", error);
    res.status(500).json({ error: "Failed to search for movies" });
  }
});



// Route: Read multiple movies by user ID
app.get("/moviesFromUser/:id", async (req: Request, res: Response) => {
  try {
    const movies = await Movie.findAll({ where: { user_id: req.params.id },
      attributes: {
        include: [
          // Add the average rating as a computed field
          [
            Sequelize.fn("AVG", Sequelize.col("ratingsReviews.rating")),
            "averageRating",
          ],
        ],
      },
      include: [
        {
          model: RR,
          as: "ratingsReviews", // Match the alias defined in the associations
          attributes: [], // Do not include all RR fields in the response
        },
        {
          model: Genre,
          as: "genres", // Match the alias for the many-to-many association
          attributes: ["genre"], // Include only the genre name
          through: { attributes: [] }, // Exclude junction table fields
        },
      ],
      group: ["Movie.movie_id", "genres.genre_id"], // Group by movie ID and genre ID
      order: [["movie_id", "DESC"]], // Sort by movie_id in ascending order
     });
     res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies with genres and ratings:", error);
    res.status(500).json({ error: "Failed to fetch movies with genres and ratings" });
  }
});

// Route: Search for movies by genre
app.get("/search/genre", async (req: Request, res: Response) => {
  try {
    const { genre } = req.query; // Get the genre from query params
    if (!genre) {
      res.status(400).json({ message: "Genre query parameter is required." });
    } else {
      // Query to find movies by genre
      const movies = await Movie.findAll({
        include: [
          {
            model: Genre,
            as: "genres",
            where: { genre }, // Filter by the genre
            attributes: ["genre"],
            through: { attributes: [] }, // Exclude join table attributes
          },
          {
            model: RR,
            as: "ratingsReviews",
            attributes: [], // We only need averageRating, not individual reviews
          },
        ],
        attributes: [
          "movie_id",
          "user_id",
          "title",
          "img",
          "desc",
          "release_yr",
          "director",
          "length",
          "producer",
          [
            Sequelize.fn("AVG", Sequelize.col("ratingsReviews.rating")),
            "averageRating", // Calculate average rating
          ],
        ],
        group: ["Movie.movie_id", "genres.genre_id"], // Group by movie and genre
      });
  
      // Send response
      res.status(200).json(movies);
    }
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
    res.status(500).json({ message: "An error occurred while fetching movies." });
  }
})


// Route: Read all movies
app.get("/movies", async (req: Request, res: Response) => {
  try {
    // Fetch all movies with their average rating and genres
    const movies = await Movie.findAll({
      attributes: {
        include: [
          // Add the average rating as a computed field
          [
            Sequelize.fn("AVG", Sequelize.col("ratingsReviews.rating")),
            "averageRating",
          ],
        ],
      },
      include: [
        {
          model: RR,
          as: "ratingsReviews", // Match the alias defined in the associations
          attributes: [], // Do not include all RR fields in the response
        },
        {
          model: Genre,
          as: "genres", // Match the alias for the many-to-many association
          attributes: ["genre"], // Include only the genre name
          through: { attributes: [] }, // Exclude junction table fields
        },
      ],
      group: ["Movie.movie_id", "genres.genre_id"], // Group by movie ID and genre ID
      order: [["movie_id", "DESC"]], // Sort by movie_id in ascending order
    });

    res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies with genres and ratings:", error);
    res.status(500).json({ error: "Failed to fetch movies with genres and ratings" });
  }
});

// app.get("/movies", async (req: Request, res: Response) => {
//   try {
//     // Fetch all movies with their average rating and genres
//     const movies = await Movie.findAll({
//       attributes: {
//         include: [
//           // Add the average rating as a computed field
//           [
//             Sequelize.fn("AVG", Sequelize.col("ratingsReviews.rating")),
//             "averageRating",
//           ],
//         ],
//       },
//       include: [
//         {
//           model: RR,
//           as: "ratingsReviews", // Match the alias defined in the associations
//           attributes: [], // Do not include all RR fields in the response
//         },
//         {
//           model: Genre,
//           as: "genres", // Match the alias for the many-to-many association
//           attributes: ["genre"], // Include only the genre name
//           through: { attributes: [] }, // Exclude junction table fields
//         },
//       ],
//       group: ["Movie.movie_id", "genres.genre_id"], // Group by movie ID and genre ID
//     });

//     res.status(200).json(movies);
//   } catch (error) {
//     console.error("Error fetching movies with genres and ratings:", error);
//     res.status(500).json({ error: "Failed to fetch movies with genres and ratings" });
//   }
// });


// Route: Insert a single rr
app.post("/rrs", async (req: Request, res: Response) => {
  try {
    const rr = await RR.create(req.body);
    res.status(201).json(rr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create rr" });
  }
});

// Route: Read a single rr by ID
app.get("/rrs/:id", async (req: Request, res: Response) => {
  try {
    const rr = await RR.findByPk(req.params.id);
    if (rr) {
      res.status(200).json(rr);
    } else {
      res.status(404).json({ error: "RR not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch rr" });
  }
});

// Route: Update a single rr by ID
app.put(
  "/rrs/:id",
  async (
    req: Request<ParamsDictionary, any, any, ParsedQs>,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params; // Get rr ID from URL
      const updatedData = req.body; // Get new data from request body

      // Find the rr by ID
      const rr = await RR.findByPk(id);

      if (!rr) {
        // If rr not found, return 404
        res.status(404).json({ error: "RR not found" });
        return;
      }

      // Update the rr with the new data
      await rr.update(updatedData);

      // Return the updated rr
      res.status(200).json(rr);
    } catch (error) {
      console.error("Error updating rr:", error);
      res.status(500).json({ error: "Failed to update rr" });
    }
  }
);

// Route: Read all rrs
app.get("/rrs", async (req: Request, res: Response) => {
  try {
    const rrs = await RR.findAll();
    res.status(200).json(rrs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch rrs" });
  }
});

// Route: Insert a single genre
app.post("/genres", async (req: Request, res: Response) => {
  try {
    const genre = await Genre.create(req.body);
    res.status(201).json(genre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create genre" });
  }
});

// Route: Read a single genre by ID
app.get("/genres/:id", async (req: Request, res: Response) => {
  try {
    const genre = await Genre.findByPk(req.params.id);
    if (genre) {
      res.status(200).json(genre);
    } else {
      res.status(404).json({ error: "Genre not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch genre" });
  }
});

// Route: Read all genres
app.get("/genres", async (req: Request, res: Response) => {
  try {
    const genres = await Genre.findAll();
    res.status(200).json(genres);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch genres" });
  }
});

// Route: Insert a single mg
app.post("/mgs", async (req: Request, res: Response) => {
  try {
    const mg = await MG.create(req.body);
    res.status(201).json(mg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create mg" });
  }
});

// Route: Read a single mg by ID
app.get("/mgs/:id", async (req: Request, res: Response) => {
  try {
    const mg = await MG.findByPk(req.params.id);
    if (mg) {
      res.status(200).json(mg);
    } else {
      res.status(404).json({ error: "MG not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch mg" });
  }
});

// Route: Read all mgs
app.get("/mgs", async (req: Request, res: Response) => {
  try {
    const mgs = await MG.findAll();
    res.status(200).json(mgs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch mgs" });
  }
});

sequelize.sync({ alter: true }).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});




// {
//   user_id: 10,
//   title: 'Taare Zameen Par',
//   img: '/uploads/1734964440123-271502859.jpg',
//   desc: 'Ishaan is criticised by his parents for his poor academic performance and is sent away to a boarding school. Ram, an art teacher, however, realises he has dyslexia and helps him uncover his potential.',
//   release_yr: '2007',
//   director: 'Aamir Khan',
//   length: '164',
//   producer: 'David Heyman',
//   genre: [ 'Family', 'Musical' ]
// }