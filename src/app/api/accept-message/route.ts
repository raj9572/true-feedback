import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

import { User } from "next-auth";


export async function POST(request: Request) {
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

    const userId = user._id;
    const { acceptMessage } = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessage },
            { new: true }
        )

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "failed to update user"
            }, {
                status: 400
            })
        }

        return Response.json({
            success: true,
            message: "message acceptence data status successfully",
            updatedUser
        }, {
            status: 200
        })

    } catch (error: any) {
        console.log('[error in accept message]', error)
        return Response.json({
            success: false,
            message: error.message
        }, {
            status: 500
        })
    }



}


export async function GET(request: Request) {
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

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId)
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "failed to found to user"
            }, {
                status: 404
            })
        }

        return Response.json({
            success: true,
            message: "",
            isAcceptingMessages: foundUser.isAcceptingMessage
        }, {
            status: 200
        })
    } catch (error) {

        return Response.json({
            success: false,
            message: "error in getting message acceptance status",

        }, {
            status: 500
        })
    }

}