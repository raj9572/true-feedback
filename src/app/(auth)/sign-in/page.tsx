"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { signInSchema } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"

const SignIn = () => {
  const [usernameMessage, setUsernameMessage] = useState("")
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  // zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  })

 

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        const result = await signIn('credentials',{
          redirect:false,
          identifier:data.identifier,
          password:data.password
        })

        console.log('result',result)

        if(result?.error){
          if (result.error === "CredentialSignin") {
            toast({
              title:"login failed",
              description:"Incorrect username or password",
              variant:"destructive"
            })
          } else{
            toast({
              title:"Error",
              description:result.error,
              variant:"destructive"
            })
          }
         
        } 

        if(result?.url){
          router.replace("/dashboard")
        }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
       <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
       <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>email/Username</FormLabel>
              <FormControl>
                <Input placeholder="email"
                 {...field}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
            <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password"
                 {...field}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isSubmitting} type="submit">
            submit
        </Button>
            </form>
            
        </Form>

        <div className="text-center mt-4">
            <p>
              Already a member? {''}
              <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">Sign up</Link>
            </p>
        </div>
    </div>
    </div>
  )
}

export default SignIn
