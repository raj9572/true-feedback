import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from 'zod'

import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})


export async function GET(request: Request) {
    


    await dbConnect()

    try {

        const { searchParams } = new URL(request.url)
        const queryParams = {
            username: searchParams.get('username')
        }
        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParams)
        console.log('result', result)

        if (!result.success) {
            const usernameErros = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErros
            },
                { status: 400 }
            )
        }

        const { username } = result.data

        const existingVerifiedUser = await UserModel.findOne({ username, isVarified: true })
        // console.log(existingVerifiedUser)
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "username is already taken"
            },
                { status: 400 }
            )
        }

        return Response.json({
            success: true,
            message: "username is unique"
        },
            { status: 200 }
        )

    } catch (error) {
        console.log("[error_check_username]", error)
        return Response.json({
            success: false,
            message: "Error checking username"
        },
            {
                status: 500
            }
        )
    }
}