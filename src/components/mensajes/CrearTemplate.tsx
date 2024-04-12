'use client'
import { useState } from "react"
import { Input } from "../ui/input"
import { trpc } from "@/lib/trpc"
import { Button } from "../ui/button"
import { toast } from "sonner"



const CrearTemplate = () => {
    const [button1, setButton1] = useState<string>('')
    const [button2, setButton2] = useState<string>('')
    const [button3, setButton3] = useState<string>('')
    const [content, setContent] = useState<string | undefined>(undefined)
    const [name, setName] = useState<string | undefined>(undefined)
    const [telefono, setTelefono] = useState('')

    const crearTemplate = trpc.whatsapp.createTemplate.useMutation()
    const sendMessageUniquePhone = trpc.whatsapp.sendMessageUniquePhone.useMutation()
    async function handleCreateTemplate() {
        // console.log(button1, button2, button3, content)
        await crearTemplate.mutateAsync({
            name: name ? name : undefined,
            content: content ? content : undefined,
            buttons: [button1, button2, button3]
        }).then(() => {
            toast.success('Plantilla creada correctamente')
            setButton1('')
            setButton2('')
            setButton3('')
            setContent('')
            setName('')
        }).catch((error) => {
            toast.error(error.message)
        }) 
    }
    async function handleSendMessage() {
        await sendMessageUniquePhone.mutateAsync({
            telefono: telefono,
            plantillaName: 'buenos_dias'
        })
    }
    return (
        <>
        <div className="max-w-[550px] py-5 px-3">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full min-h-40" placeholder="Cuerpo del mensaje"></textarea>
            <div className="flex justify-between items-center pb-3">
                <Input placeholder="Botón 1" className="w-[150px]" value={button1} onChange={(e) => setButton1(e.target.value)} />
                <Input placeholder="Botón 2" className="w-[150px]" value={button2} onChange={(e) => setButton2(e.target.value)} />
                <Input placeholder="Botón 3" className="w-[150px]" value={button3} onChange={(e) => setButton3(e.target.value)} />
            </div>
            <div className="flex justify-end items-center gap-x-3 pb-3">
                <Input placeholder="Nombre de la plantilla" value={name} onChange={(e) => setName(e.target.value)} />
                <Button className="flex justify-center items-center gap-x-2" onClick={handleCreateTemplate}>
                {crearTemplate.isLoading && 
                    <svg
                    id="loader"
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 200 200"
                    >
                    <radialGradient
                    id="a12"
                    cx=".66"
                    fx=".66"
                    cy=".3125"
                    fy=".3125"
                    gradientTransform="scale(1.5)"
                    >
                    <stop offset="0" stopColor="#FFFFFF"></stop>
                    <stop offset=".3" stopColor="#FFFFFF" stopOpacity=".9"></stop>
                    <stop offset=".6" stopColor="#FFFFFF" stopOpacity=".6"></stop>
                    <stop offset=".8" stopColor="#FFFFFF" stopOpacity=".3"></stop>
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0"></stop>
                    </radialGradient>
                    <circle
                    origin="center"
                    fill="none"
                    stroke="url(#a12)"
                    strokeWidth="15"
                    strokeLinecap="round"
                    strokeDasharray="200 1000"
                    strokeDashoffset="0"
                    cx="100"
                    cy="100"
                    r="70"
                    >
                    <animateTransform
                        type="rotate"
                        attributeName="transform"
                        calcMode="spline"
                        dur="2"
                        values="360;0"
                        keyTimes="0;1"
                        keySplines="0 0 1 1"
                        repeatCount="indefinite"
                    ></animateTransform>
                    </circle>
                    <circle
                    origin="center"
                    fill="none"
                    opacity=".2"
                    stroke="#FFFFFF"
                    strokeWidth="15"
                    strokeLinecap="round"
                    cx="100"
                    cy="100"
                    r="70"
                    ></circle>
                    </svg>
                }
                    <p>Guardar</p>
                </Button>
            </div>
            <div className="flex justify-between">
                <Input placeholder="Celular" className="w-fit" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                <Button onClick={handleSendMessage}>
                    <p>Enviar mensaje</p>
                </Button>
            </div>
        </div>
        </>
    )
}

export default CrearTemplate