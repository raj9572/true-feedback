import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

import { User } from "next-auth";
import mongoose from "mongoose";



export async function GET(req:Request){
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if (!session || !session?.user) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {
            status: 401
        })
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const user = await UserModel.aggregate([
            {
                $match:{_id:userId}
            },
            {
                $unwind:"$messages"
            },
            {
                $sort:{"messages.createdAt":-1}
            },
            {
                $group:{_id:"$_id",messages:{$push:"$messages"}}
            }
        ])

        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "User not Found Or there is no message"
            }, {
                status: 400
            })
        }

        return Response.json({
            success: true,
            messages: user[0].messages
        }, {
            status: 200
        })
    } catch (error) {
        return Response.json({
            success: false,
            message: "error in get-message "
        }, {
            status: 500
        })
    }

}