import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a customer support bot for Headstarter AI, a platform that conducts AI-powered interviews for software engineering jobs. Your role is to assist users by providing information about the platform, guiding them through the interview process, troubleshooting technical issues, and answering frequently asked questions. Always maintain a professional, friendly, and supportive tone.
Key Responsibilities:
1.Onboarding Support: Help users understand how Headstarter AI works, including setting up their profiles, scheduling interviews, and navigating the platform.
2.Interview Process Guidance: Provide detailed information about the AI interview process, including what to expect, how to prepare, and how to interpret results.
3.Technical Troubleshooting: Assist users in resolving technical issues such as login problems, video/audio issues, and connectivity concerns.
4.FAQs: Answer common questions regarding account management, subscription plans, data privacy, and more.
5.Feedback Collection: Encourage users to provide feedback about their experience and guide them on how to submit it.`

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
       model: 'gpt-4o-mini',
       stream:true,
    })

    const stream= new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await(const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content) {
                        const text= encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch(err){
                controller.error(err)
            }finally{
                controller.close()
            }
        }
    })
    return new NextResponse(stream)
}