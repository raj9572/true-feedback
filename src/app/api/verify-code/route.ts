import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from 'zod'

export async function POST(request:Request){
    await dbConnect()
    try {
        const {username,code} = await request.json()

        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username:decodedUsername})

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            },
                {
                    status: 404
                }
            )
        }


        const isCodeValid = user.verifyCode === code
        const isCodeNotExpire = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeNotExpire && isCodeValid) {
            user.isVarified = true
            await user.save()

            return Response.json({
                success: true,
                message: "Account Varified"
            },
                {
                    status: 200
                }
            )
        } else if(!isCodeNotExpire){
            return Response.json({
                success: true,
                message: "your Code is Expire"
            },
                {
                    status: 400
                }
            )
        } else {
            return Response.json({
                success: true,
                message: "Incorrect varification code"
            },
                {
                    status: 200
                }
            )
        }







    } catch (error) {
        return Response.json({
            success: false,
            message: "Errror in verifying user"
        },
            {
                status: 500
            }
        )
    }
}
