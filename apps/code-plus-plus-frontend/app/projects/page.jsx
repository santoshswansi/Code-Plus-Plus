"use client"
import React, { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { PROJECTS } from '@/constants';
import useGlobalStore from '@/store/useGlobalStore';
import Projects from '@/components/Projects';

function page() {
    const {tab, setTab} = useGlobalStore();

    useEffect(() => {
        setTab(PROJECTS)
    }, []);

    return (
        <div className="flex w-full h-[100vh]">
            <div>
                <Sidebar />
            </div>
            <div className="w-[100%]">
                <Projects />
            </div>
        </div>
    )
}

export default page