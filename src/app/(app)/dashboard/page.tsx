"use client"
import MessageCard from '@/components/MessageCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Message } from '@/models/User'
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2, RefreshCcw } from 'lucide-react'
import { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { axiosClient } from '@/helpers/axiosClient'

const Page = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSwitchLoading, setIsSwitchLoading] = useState(false)
    const [profileUrl, setProfileUrl] = useState<string>("")
    let { toast } = useToast()
    const router = useRouter()

    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId))
        toast({
            title:"Message Deleted successuly"
        })
    }

    const { data: session } = useSession()

    

    const form = useForm({
        resolver: zodResolver(AcceptMessageSchema)
    })

    const { register, watch, setValue } = form
    const acceptMessages = watch('acceptMessages')

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true)
        try {
            const response = await axiosClient.get<ApiResponse>("accept-message")

            setValue('acceptMessages', response.data.isAcceptingMessages)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch messages settings",
                variant: "destructive"
            })

        }
        finally {
            setIsSwitchLoading(false)
        }
    }, [setValue])


    const fetchMessages = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true)
        setIsSwitchLoading(false)
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages')
            setMessages(response.data.messages || [])

            if (refresh) {
                toast({
                    title: "Refreshed messages",
                    description: "showing latest messages"
                })
            }

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch messages settings",
                variant: "destructive"
            })
        }
        finally {
            setIsSwitchLoading(false)
            setIsLoading(false)
        }
    }, [setIsLoading, setMessages])


    function makeProfileUrl () {
        const {username} = session?.user as User
        // todo do more research
            const baseUrl = `${window.location.protocol}//${window.location.host}`
            setProfileUrl(`${baseUrl}/u/${username}`)
    }

    useEffect(() => {
        
        if (!session || !session.user) return
         makeProfileUrl()
        fetchMessages()
        fetchAcceptMessage()

    }, [session, setValue, fetchAcceptMessage, fetchMessages])

    // handle switch change

    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>("/api/accept-message", { acceptMessage: !acceptMessages })
            setValue("acceptMessages", !acceptMessages)
            toast({
                title: response.data.message,
                variant: "default"
            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to change in handle switch ",
                variant: "destructive"
            })
        }
    }


    //   const {username} = session?.user as User
    //     // todo do more research
    //   const baseUrl = `${window.location.protocol}//${window.location.host}`
    //   const profileUrl = `${baseUrl}/u/${username}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl)
        toast({
            title: "Url copied ",
            description: "profile url has been copied to clipboard"
        })
    }

    if (!session || !session?.user) {
         return  <div>Login first</div>
    }

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>
            <Separator />

            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <MessageCard
                            key={message._id}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    );
}

export default Page

