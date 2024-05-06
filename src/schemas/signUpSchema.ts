import {z} from 'zod'


   export const usernameValidation = z.string()
                                        .min(3,"Username must be atleast 3 char")
                                        .max(20,"no more than 20 char")
                                        .regex(/^[a-zA-Z0-9_]*$/,"username must not contain special char")
    
 


export const signUpSchema = z.object({
    username:usernameValidation,
    email:z.string().email({message:"Invalid email address"}),
    password:z.string().min(6,{message:"min atleast 6 char"})
    
  });