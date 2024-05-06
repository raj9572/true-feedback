"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { ApiResponse } from '@/types/ApiResponse'
import axios, { AxiosError } from 'axios'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

const MessagePage = () => {
  const {username} = useParams()
  const [messageText, setMessageText] = useState("")

  const { data: session } = useSession()
  console.log('session',session)


  const SendMessageToUser = async() =>{
      try {
         const res = await axios.post<ApiResponse>("/api/send-messages",{username,content:messageText})
          toast({
             title:res.data.message
          })
          setMessageText("")
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        toast({
            title: "Error",
            description: axiosError.response?.data.message || "Failed to send messages",
            variant: "destructive"
        })
      }
  }

  const handleInputText = (e:any) =>{
      setMessageText(e.target.value)
  }

  return (
    <div className='max-w-5xl py-20 mx-auto'>

        <div className='flex flex-col gap-4 items-center'>
          <h1 className='text-4xl font-extrabold'>Public Profile Link</h1>
          <div className='w-full  '>
            <Label className='font-bold '>Send Anonymous Messages to @{username}</Label>
            <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} type="text" style={{outline:"none  !important"}} className='p-5 pb-7 focus:outline-none border-2 mt-2  ' placeholder='Write your anonymous message here' />
          </div>
          <Button disabled={messageText.length < 4} onClick={SendMessageToUser} className='bg-gray-600 text-white'>Send it</Button>
        </div>


        <div className='md:py-7 py-2  '>
             <Button>Suggest Messages</Button>
             <p className=' text-black font-medium my-4'>Click on any message below to select it.</p>
             <div className='border-2 p-4'>
                <h1 className='font-semibold text-xl'>Messages</h1>
                <div className='flex flex-col gap-4 my-4'>
                   <Input onClick={handleInputText} type='text' className='cursor-pointer' readOnly value="Write your favourite movie"/>
                   <Input onClick={handleInputText} type='text' className='cursor-pointer  '  readOnly value="Do you have any pets"/>
                   <Input onClick={handleInputText} type='text' className='cursor-pointer '  readOnly value="What is your dream job"/>
                    {/* <Input className='bg-white text-black border-2 '>Write your favourite movie</Input>
                    <Input className='bg-white text-black border-2 '>Do you have any pets</Input>
                    <Input className='bg-white text-black border-2 ' >What is your dream job</Input> */}
                </div>
             </div>
        </div>
    </div>
  )
}

export default MessagePage
