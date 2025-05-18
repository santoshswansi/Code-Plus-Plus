"use client"
import React, { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import WhiteboardWrapper from '@/components/WhiteboardWrapper'
import { WHITEBOARD } from '@/constants';
import useGlobalStore from '@/store/useGlobalStore';

function page() {
    const {tab, setTab} = useGlobalStore();

    useEffect(() => {
        setTab(WHITEBOARD)
    }, []);

    return (
        <div className="flex w-full h-[100vh]">
            <div>
                <Sidebar />
            </div>
            <div className="w-[100%]">
                <WhiteboardWrapper />
            </div>
        </div>
    )
}

export default page