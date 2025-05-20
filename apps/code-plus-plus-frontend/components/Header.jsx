"use client"
import React, { useRef, useState } from 'react'
import Logo from './Logo'
import { Dialog } from 'primereact/dialog';
import { Bell } from 'lucide-react';
import Login from './Login';
import useAuthStore from '@/store/useAuthStore';
import Profile from './Profile';
import { handleLogout } from '@/api/auth';
import { OverlayPanel } from 'primereact/overlaypanel';
import { LOGIN_MODE } from '@/constants';

function Header() {
    const [loginDialogVisible, setLoginDialogVisible] = useState(false);
    const {name, accessToken, isLogging} = useAuthStore();
    const logoutOverlapPanel = useRef();
    const [mode, setMode] = useState(LOGIN_MODE);

    const logout = () => {
        const checkLogout = async () => {
            await handleLogout(); 
            logoutOverlapPanel.current?.hide();
        };

        checkLogout();
    }

    return (
        <div className={`flex items-center justify-between w-screen h-10 !px-6 !py-1 bg-white font-(family-name:--font-space-grotesk)`}>
            <section className="flex items-center justify-between w-45">
                <div>
                    <Logo/>
                </div>
            </section>

            <section className="flex items-center gap-4">
                <Bell className="h-6 w-6 cursor-pointer"/>
                {
                    accessToken !== "" ? (
                        <div className="cursor-pointer" onClick={(e) => logoutOverlapPanel.current.toggle(e)}><Profile name={name} width={7} textSize="lg" extraTailwindClasses="hover:bg-slate-700" /></div>
                    ) : (
                        <button
                            className={`h-7 w-14 rounded-sm flex items-center justify-center text-white ${isLogging ? "bg-indigo-500" : "bg-indigo-600 hover:bg-indigo-500 cursor-pointer"} transition-colors`}
                            onClick={() => setLoginDialogVisible(true)}
                        >
                        Login
                        </button>
                    )
                }
            </section>

            <Dialog header={`${mode === LOGIN_MODE ? "Login": "Register"}`} visible={loginDialogVisible} className='bg-white shadow-md rounded-2xl z-100 !px-6 !py-4' onHide={() => {if (!loginDialogVisible) return; setLoginDialogVisible(false); }}>
                <Login setLoginDialogVisible={setLoginDialogVisible} mode={mode} setMode={setMode} />
            </Dialog>

            <OverlayPanel ref={logoutOverlapPanel}>
                <div className="!p-2 min-w-55 min-h-25 flex flex-col items-center justify-center rounded-md shadow-[0px_0px_10px_rgba(0,0,0,0.13)] gap-1 !font-(family-name:--font-space-grotesk)">
                    <p className="text-slate-600">{`👋 ${name}, How’s it going?`}</p>
                    <button className="bg-black rounded-sm !px-2 text-white cursor-pointer hover:bg-slate-700 h-7" onClick={() => logout()}>Logout</button>
                </div>
            </OverlayPanel>
        </div>
    )
}

export default Header