import { Request, Response } from "express";
import User from "../../models/Users"

export const getAllUsers = async (req: Request, res: Response)=>{
    try {
        const users = await User.findAll();
        res.status(200).json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch users" });
      }
}