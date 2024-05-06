
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Message } from "@/models/User";



export async function POST(request:Request){
    await dbConnect()
   
   const {username,content} = await request.json()

   try {
    const user = await UserModel.findOne({username})
    if (!user) {
        return Response.json({
            success: false,
            message: "user Not Found"
        }, {
            status: 404
        })
    }

    // is user accepting the messsages
    if (!user.isAcceptingMessage) {
        return Response.json({
            success: false,
            message: "user User is not accepting the messages"
        }, {
            status: 400
        })
    }

    const newMessage = {content,createdAt:new Date()}

    user.messages.push(newMessage as Message ) 
    await user.save()

    return Response.json({
        success: true,
        message: "message send successfully"
    }, {
        status: 200
    })




   } catch (error) {
    console.log( "error in send -message",error)
    
    return Response.json({
        success: false,
        message: "error in send -message"
    }, {
        status: 500
    })
   }

}