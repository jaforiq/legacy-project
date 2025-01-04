import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./../src/sequelize";

// Define the attributes of the Movie table
interface MovieAttributes {
  movie_id: number;
  user_id: number;
  title: string;
  img?: string;
  desc?: string;
  release_yr: number;
  director?: string;
  length?: number;
  producer?: string;
}

// Define creation attributes (attributes required during creation)
interface MovieCreationAttributes extends Optional<MovieAttributes, "movie_id"> {}

// Extend the Sequelize Model class with Movie attributes
class Movie extends Model<MovieAttributes, MovieCreationAttributes> {}

Movie.init(
  {
    movie_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    img: {
      type: DataTypes.TEXT,
    },
    desc: {
      type: DataTypes.TEXT,
    },
    release_yr: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    director: {
      type: DataTypes.STRING(50),
    },
    length: {
      type: DataTypes.SMALLINT,
    },
    producer: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    tableName: "movies",
    timestamps: false,
  }
);

export default Movie;
