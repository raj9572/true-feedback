import {z} from 'zod'


 

export const messageSchema = z.object({
     content:z.string()
              .min(10,{message:"content must be atleast of 10 char"})
              .max(300,{message:"content must be no longer of 300 char"})
  });