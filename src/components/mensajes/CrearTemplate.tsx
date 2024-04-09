'use client'
import { useState } from "react"
import { Input } from "../ui/input"
import { trpc } from "@/lib/trpc"
import { Button } from "../ui/button"



const CrearTemplate = () => {
    const [button1, setButton1] = useState<string | undefined>(undefined)
    const [button2, setButton2] = useState<string | undefined>(undefined)
    const [button3, setButton3] = useState<string | undefined>(undefined)
    const [content, setContent] = useState<string | undefined>(undefined)
    const [name, setName] = useState<string | undefined>(undefined)

    const crearTemplate = trpc.whatsapp.createTemplate.useMutation()
    async function handleCreateTemplate() {
        // console.log(button1, button2, button3, content)
        // setButton1('')
        // setButton2('')
        // setButton3('')
        // setContent('')
        await crearTemplate.mutateAsync({
            name: name ? name : undefined,
            content: content ? content : undefined,
            buttons: [button1, button2, button3]
        })  
    }
    return (
        <div className="max-w-[550px] py-5 px-3">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full min-h-40" placeholder="Cuerpo del mensaje"></textarea>
            <div className="flex justify-between items-center pb-3">
                <Input className="w-[150px]" value={button1} onChange={(e) => setButton1(e.target.value)} />
                <Input className="w-[150px]" value={button2} onChange={(e) => setButton2(e.target.value)} />
                <Input className="w-[150px]" value={button3} onChange={(e) => setButton3(e.target.value)} />
                {/* <input value={button1} onChange={(e) => setButton1(e.target.value)}></input>
                <input value={button2} onChange={(e) => setButton2(e.target.value)}></input>
                <input value={button3} onChange={(e) => setButton3(e.target.value)}></input> */}
            </div>
            <div className="flex justify-end items-center gap-x-3">
                <Input placeholder="Nombre de la plantilla" value={name} onChange={(e) => setName(e.target.value)} />
                <Button onClick={handleCreateTemplate}>Guardar</Button>
            </div>
        </div>
    )
}

export default CrearTemplate