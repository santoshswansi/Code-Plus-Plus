"use client"
import React from 'react'
import {Pencil, Eraser, Minus} from "lucide-react"
import { PENCIL, ERASER, RED, BLACK, BLUE, STROKE_WIDTH_1, STROKE_WIDTH_2, STROKE_WIDTH_3 } from '@/constants'

function WhiteBoardController({isPencilOrEraser, setIsPencilOrEraser, strokeColorName, setStrokeColorName, strokeWidthName, setStrokeWidthName}) {
    return (
        <div className="flex items-center justify-around h-[45] w-[400] shadow-[0px_0px_10px_rgba(0,0,0,0.13)] rounded-md gap-4 !px-4">
            <div className={`flex items-center justify-center ${isPencilOrEraser === PENCIL && "bg-slate-200"} h-7 w-7 rounded-sm cursor-pointer`} onClick={() => setIsPencilOrEraser(PENCIL)}><Pencil className="h-5 w-5"/></div>
            <div className={`flex items-center justify-center ${isPencilOrEraser === ERASER && "bg-slate-200"} h-7 w-7 rounded-sm cursor-pointer`} onClick={() => setIsPencilOrEraser(ERASER)}><Eraser className="h-5 w-5"/></div>
            <div className="text-slate-200 text-sm scale-y-190">|</div>
            <div className="flex gap-2">
                <div className={`flex items-center justify-center ${strokeColorName === BLACK && "bg-slate-200"} h-7 w-7 rounded-sm cursor-pointer`} onClick={() => setStrokeColorName(BLACK)}><div className="rounded-full bg-black h-5 w-5"></div></div>
                <div className={`flex items-center justify-center ${strokeColorName === BLUE && "bg-slate-200"} h-7 w-7 rounded-sm cursor-pointer`} onClick={() => setStrokeColorName(BLUE)}><div className="rounded-full bg-indigo-500 h-5 w-5"></div></div>
                <div className={`flex items-center justify-center ${strokeColorName === RED && "bg-slate-200"} h-7 w-7 rounded-sm cursor-pointer`} onClick={() => setStrokeColorName(RED)}><div className="rounded-full bg-red-500 h-5 w-5"></div></div>
            </div>
            <div className="text-slate-200 text-sm scale-y-190">|</div>
            <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center ${strokeWidthName === STROKE_WIDTH_1 && "bg-slate-200"} h-7 w-7 rounded-sm cursor-pointer`} onClick={() => setStrokeWidthName(STROKE_WIDTH_1)}><Minus className="h-5 w-5 stroke-[1]"/></div>
                <div className={`flex items-center justify-center ${strokeWidthName === STROKE_WIDTH_2 && "bg-slate-200"} h-7 w-7 rounded-sm cursor-pointer`} onClick={() => setStrokeWidthName(STROKE_WIDTH_2)}><Minus className="h-5 w-5 stroke-[3]"/></div>
                <div className={`flex items-center justify-center ${strokeWidthName === STROKE_WIDTH_3 && "bg-slate-200"} h-7 w-7 rounded-sm cursor-pointer`} onClick={() => setStrokeWidthName(STROKE_WIDTH_3)}><Minus className="h-5 w-5 stroke-[5]"/></div>
            </div>
        </div>
    )
}

export default WhiteBoardController