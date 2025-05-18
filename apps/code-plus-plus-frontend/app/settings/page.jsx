"use client"
import React, { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { SETTINGS } from '@/constants';
import useGlobalStore from '@/store/useGlobalStore';
import Settings from '@/components/Settings';

function page() {
    const {tab, setTab} = useGlobalStore();

    useEffect(() => {
        setTab(SETTINGS)
    }, []);

    return (
        <div className="flex w-full h-[100vh]">
            <div>
                <Sidebar />
            </div>
            <div className="w-[100%]">
                <Settings />
            </div>
        </div>
    )
}

export default page