"use client"
import React, { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { COLLABORATORS } from '@/constants';
import useGlobalStore from '@/store/useGlobalStore';
import Collaborators from '@/components/Collaborators';

function page() {
    const {tab, setTab} = useGlobalStore();

    useEffect(() => {
        setTab(COLLABORATORS)
    }, []);

    return (
        <div className="flex w-full h-[100vh]">
            <div>
                <Sidebar />
            </div>
            <div className="w-[100%]">
                <Collaborators />
            </div>
        </div>
    )
}

export default page