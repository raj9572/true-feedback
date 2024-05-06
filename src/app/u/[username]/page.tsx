"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { toast } from "@/components/ui/use-toast"
import { useCompletion } from "ai/react"
import { messageSchema } from "@/schemas/messageSchema"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
    return messageString.split(specialChar);
};

const initialMessageString =
    "What's your favorite movie?||Do you have any pets?||What's your dream job?";



const Page = () => {

    const { username } = useParams<{ username: string }>()
    const [isLoading, setIsLoading] = useState(false)
    // const [inputMessage,setInputMessage] = useState("")
    const {
        complete,
        completion,
        isLoading: isSuggestLoading,
        error,
    } = useCompletion({
        api: '/api/suggest-messages',
        initialCompletion: initialMessageString,
    });


    let mount = 0
    console.log(mount++)

    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema)
    })

    const { watch } = form

    const inputMessage = watch("content")

    // useEffect(()=>{
    //     const subscribe = watch((data)=>{
    //         return setInputMessage(data.content as string)
    //     })

    //     return ()=>subscribe.unsubscribe()
    // },[watch])



    const onSubmit = async (data: z.infer<typeof messageSchema>) => {
        setIsLoading(true)
        try {
            const res = await axios.post<ApiResponse>("/api/send-messages", { username, content:data.content })
            toast({
                title: res.data.message
            })
            form.reset({ ...form.getValues(), content: "" })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to send messages",
                variant: "destructive"
            })
        }
        finally {
            setIsLoading(false)
        }
    }


    const handleMessageClick = async (message: string) => {
        form.setValue("content", message)

    }

    const fetchSuggestedMessages = async () => {
        try {
            complete('');
        } catch (error) {
            console.error('Error fetching messages:', error);
            // Handle error appropriately
        }
    };

    return (
        <>
            <div className="max-w-5xl mx-auto py-10 ">
                <div className="" >
                    <h1 className="text-4xl font-extrabold text-center mb-8">Public Profile Link{inputMessage}</h1>
                    <Form  {...form}  >
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8   ">
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold ">Send Anonymous Messages to @{username}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Write your anonymous message here'
                                                className="resize-none"
                                                {...field}
                                                
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-center">
                                {
                                    isLoading ? (
                                        <Button disabled >
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Please wait
                                        </Button>
                                    ) : (
                                        <Button type="submit" disabled={isLoading || !inputMessage } >send</Button>
                                    )
                                }

                            </div>
                        </form>
                    </Form>
                </div>


                <div className="space-y-4 my-10">
                    <div className="space-y-2">
                        <Button
                        onClick={fetchSuggestedMessages}
                        className="my-4"
                         disabled={isSuggestLoading}
                        >
                            Suggestion Messages
                        </Button>
                        <p>Click on any message below to select it.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Messages</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-4">
                            {error ? (
                                <p className="text-red-500">{error.message}</p>
                            ) : (
                                parseStringMessages(completion).map((message, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="mb-2"
                                        onClick={() => handleMessageClick(message)}
                                    >
                                        {message}
                                    </Button>
                                ))
                            )}
                        </CardContent>

                    </Card>

                </div>

                <Separator className="my-6" />
                <div className="text-center">
                    <div className="mb-4">Get Your Message Board</div>
                    <Link href={'/sign-up'}>
                        <Button>Create Your Account</Button>
                    </Link>
                </div>



            </div>




        </>
    )
}

export default Page
