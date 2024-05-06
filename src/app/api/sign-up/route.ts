import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from 'bcryptjs'

import { sendVarificationEmail } from "@/helpers/sendVarificationEmail";

export async function POST(request:Request){

    await dbConnect()
    try {
        const {username,email,password} = await request.json()

        const existingUserVerifyByUsername = await UserModel.findOne({
            username,
            isVarified:true
        })

        if (existingUserVerifyByUsername) {
            return Response.json({
                success:false,
                message:"username is already taken"
            },{
                status:400
            })
        }
        const existingUserByEmail = await UserModel.findOne({email})


        const verifyCode = Math.floor(100000 + Math.random()*900000).toString()
        console.log('verifyCode',verifyCode)

        if (existingUserByEmail) {
                if(existingUserByEmail.isVarified){
                    return Response.json({
                        success:false,
                        message:"User already exist with this email"
                    },{
                        status:400
                    }) 
                } else{
                    const hashedPassword = await bcrypt.hash(password, 10)
                    existingUserByEmail.password = hashedPassword
                    existingUserByEmail.verifyCode = verifyCode
                    existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                    await existingUserByEmail.save()
                }
        }else{
            const hashedPassword = await bcrypt.hash(password,10)
            const expiryDate = new Date()   // --> Thu Apr 18 2024 20:24:02 GMT+0530 (India Standard Time)
            // console.log(expiryDate)
            expiryDate.setHours(expiryDate.getHours() + 1)
            // console.log(expiryDate)   // ---> Thu Apr 18 2024 21:24:02 GMT+0530 (India Standard Time)

            const newUser = new UserModel({
                username,
                email,
                password:hashedPassword,
                verifyCode,
                verifyCodeExpiry:expiryDate,
                isVarified:false,
                isAcceptingMessage:true,
                messages:[]
            })

            await newUser.save()
        }


        // send verification email

        const emailResponse = await sendVarificationEmail(
            email,
            username,
            verifyCode
        )

        console.log('emailresponse',emailResponse)

        if (!emailResponse.success) {
            return Response.json({
                success:false,
                message:emailResponse.message
            },{
                status:500
            })
        }


        return Response.json({
            success:true,
            message:"User registerd successfully , please verify your email"
        },{
            status:201
        })



    } catch (error) {
        console.log("[signup-post]",error)
        return Response.json(
            {
            success:false,
            message:"Error registering error"
        },
        {
            status:500
        }
      )
    }
}
