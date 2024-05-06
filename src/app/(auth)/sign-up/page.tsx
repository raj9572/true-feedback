"use client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { signUpSchema } from "@/schemas/signUpSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from 'axios'
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDebounceCallback } from 'usehooks-ts'
import * as z from "zod"

const Signup = () => {
  const [username, setUsername] = useState("")
  const [usernameMessage, setUsernameMessage] = useState("")
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debouncedUsername = useDebounceCallback(setUsername, 300)
  const { toast } = useToast()
  const router = useRouter()

  // zod implementationḍ
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  })

  useEffect(()=>{
      const checkUsernameUniqueness = async()=>{
        if(username){
          setIsCheckingUsername(true)
          setUsernameMessage("")
          try {
            const response =  await axios.get(`/api/check-username-unique?username=${username}`)
            //  let message = response.data.message
            setUsernameMessage(response.data.message)

          } catch (error) {
             console.log('[checkusername-error]',error)
             const axiosError = error as AxiosError<ApiResponse>
             setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
          }
          finally{
            setIsCheckingUsername(false)
          }
        }
      }

      checkUsernameUniqueness()
  },[username])


  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data)
      toast({
        title: "Success",
        description: response.data.message,

      })
      router.replace(`/verify/${username}`)
      setIsSubmitting(false)

    } catch (error) {
      console.log('[Error in signup user]', error)
      const axiosError = error as AxiosError<ApiResponse>
      let errorMessage = axiosError.response?.data.message
      toast({
        title: "signup failed",
        description: errorMessage,
        variant: "destructive"
      })
      setIsSubmitting(false)
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username"
                 {...field}
                 onChange={(e) =>{
                  field.onChange(e)
                  setUsername(e.target.value)
                 }}
                  />
                  
              </FormControl>
              {isCheckingUsername && <Loader2 className="animate-spin"/>}
              <p className={`text-sm ${usernameMessage=== "username is unique" ? "text-green-500":"text-red-500"}`}>test {usernameMessage}</p>
              <FormMessage />
            </FormItem>
          )}
        />
            <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>email</FormLabel>
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
          {
            isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait
              </>
            ) : ('Signup')
          }
        </Button>
            </form>
            
        </Form>
        <div className="text-center mt-4">
            <p>
              Already a member? {''}
              <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">Sign in</Link>
            </p>
        </div>
    </div>
    </div>
  )
}

export default Signup
