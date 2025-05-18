"use client"
import React, { useState } from 'react'
import WhiteBoardController from './WhiteBoardController'
import Whiteboard from './Whiteboard'
import { DEFAULT_PENCIL_ERASER, DEFAULT_STROKE_COLOR_NAME, DEFAULT_STROKE_WIDTH_NAME, WHITEBOARD } from '@/constants'
import TabContainer from './TabContainer'

function WhiteboardWrapper() {
    const [isPencilOrEraser, setIsPencilOrEraser] = useState(DEFAULT_PENCIL_ERASER)
    const [strokeColorName, setStrokeColorName] = useState(DEFAULT_STROKE_COLOR_NAME)
    const [strokeWidthName, setStrokeWidthName] = useState(DEFAULT_STROKE_WIDTH_NAME)

    return (
        <div className="relative w-[100%] h-[100%]">
            <div className="absolute z-10 !mt-[12] left-1/2 -translate-x-1/2">
                <WhiteBoardController 
                    isPencilOrEraser={isPencilOrEraser} 
                    setIsPencilOrEraser={setIsPencilOrEraser}
                    strokeColorName={strokeColorName}
                    setStrokeColorName={setStrokeColorName}
                    strokeWidthName={strokeWidthName}
                    setStrokeWidthName={setStrokeWidthName}
                />
            </div>
            <Whiteboard isPencilOrEraser={isPencilOrEraser} strokeColorName={strokeColorName} strokeWidthName={strokeWidthName} />
            <div className="fixed bottom-2 right-2">
                <TabContainer codeOrWhiteboard={WHITEBOARD} />
            </div>
        </div>
    )
}

export default WhiteboardWrapper