import { DataTypes, Model } from "sequelize";
import sequelize from "./../src/sequelize";

class Genre extends Model {}

Genre.init(
  {
    genre_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    genre: {
        type: DataTypes.STRING(10),
        unique: true,
        allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "genre",
    timestamps: false,
  }
);

export default Genre;