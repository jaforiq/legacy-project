import { DataTypes, Model } from "sequelize";
import sequelize from "./../src/sequelize";
import Movie from "./Movies";

class RR extends Model {}

RR.init(
  {
    rr_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    movie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
        type: DataTypes.REAL,
        allowNull: false,
      },
    review: {
        type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: "ratings_reviews",
    timestamps: false,
  }
);


export default RR;