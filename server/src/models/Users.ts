import { DataTypes, Model } from "sequelize";
import sequelize from "./../src/sequelize";

class User extends Model {}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
    },
    email: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false,
  }
);

export default User;