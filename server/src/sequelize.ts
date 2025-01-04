import { Sequelize } from "sequelize";
import dbConfig from "./dbConfig";

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect as any,
  logging: console.log, // This enables logging of raw SQL queries to the console
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
  
  export default sequelize;