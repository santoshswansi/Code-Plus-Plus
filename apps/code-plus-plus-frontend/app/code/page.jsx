"use client"
import React, { useEffect, useState } from 'react'
import CodeEditorWrapper from '@/components/CodeEditorWrapper'
import Sidebar from '@/components/Sidebar'
import useGlobalStore from "@/store/useGlobalStore";
import { CODE } from '@/constants';


function page() {
    const {tab, setTab} = useGlobalStore();

    useEffect(() => {
        setTab(CODE)
    }, []);

    return (
        <div className="flex w-full h-[100vh]">
            <div className="!h-[100vh]">
                <Sidebar />
            </div>
            <div className="w-[100%]">
                <CodeEditorWrapper />
            </div>
        </div>
    )
}

export default page