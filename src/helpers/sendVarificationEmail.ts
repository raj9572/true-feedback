import { resend } from "@/lib/resend";

import VerificationEmail from "../../emails/VarificationEmail";

import { ApiResponse } from "@/types/ApiResponse";

export async function sendVarificationEmail(
    email:string,
    username:string,
    verifyCode:string
):Promise<ApiResponse>{

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'mystry message | Verification code',
            react: VerificationEmail({username,otp:verifyCode}),
          });
        return {success:true, message:"verification email send successfully"}
    } catch (emailError) {
        console.log('error sending verification email',emailError)
        return {success:false, message:"failed to send verification email"}
    }

}