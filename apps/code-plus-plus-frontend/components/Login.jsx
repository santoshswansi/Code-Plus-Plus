"use client"
import { LOGIN_MODE, SIGNUP_MODE } from '@/constants';
import React, {useState} from 'react';
import Logo from './Logo';
import { handleLogin, handleSignup } from '@/api/auth';

function Login({setLoginDialogVisible}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mode, setMode] = useState(LOGIN_MODE);

    const handleAuthentication = async () => {
        if(mode === LOGIN_MODE){
            if(await handleLogin(email, password)){
                setLoginDialogVisible(false);
            }
        }else{
            if(await handleSignup(name, email, password)){
                setLoginDialogVisible(false);
            }
        }
    };

    return (
        <div className="h-105 w-68 shadow-md flex flex-col items-center justify-around">
            <section className="flex flex-col items-center justify-center">
                <Logo />
                <p className="text-sm">Real-time collaborative coding platform</p>
            </section>
            <section className="w-full">
                <div className="flex items-center justify-around w-full">
                    <p onClick={(e) => setMode(LOGIN_MODE)} className={`flex justify-center border-b border-solid border-slate-200 ${mode == LOGIN_MODE ? "!border-black border-b-2" : ""} w-full cursor-pointer !pb-1`}>Sign in</p>
                    <p onClick={(e) => setMode(SIGNUP_MODE)} className={`flex justify-center border-b border-solid border-slate-200 ${mode == SIGNUP_MODE ? "!border-black border-b-2" : ""} w-full cursor-pointer !pb-1`}>Sign up</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    {
                        mode === SIGNUP_MODE &&
                        <div className="flex flex-col items-start justify-center !mt-2 !mb-1 w-full">
                            <label id="name">Name</label>
                            <input 
                                type="text" 
                                id="name"
                                value={name}
                                placeholder="Enter your name" 
                                onChange={(e) => setName(e.target.value)}
                                className="border border-solid border-slate-200 rounded-sm w-full !px-1 !mt-1 focus:outline-none"
                            />
                        </div>
                    }
                    <div className="flex flex-col items-start justify-center !mt-2 !mb-1 w-full">
                        <label id="email">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email}
                            placeholder="Enter your email" 
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-solid border-slate-200 rounded-sm w-full !px-1 !mt-1 focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col items-start justify-center !my-1 w-full">
                        <label id="password">Password</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password}
                            placeholder="Enter your password" 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="border border-solid border-slate-200 rounded-sm w-full !px-1 !mt-1 focus:outline-none"   
                        />
                    </div>
                    {
                        mode === SIGNUP_MODE &&
                        (<div className="flex flex-col items-start justify-center !mt-1 w-full">
                            <label id="confirm-password">Confirm password</label>
                            <input 
                                type="password" 
                                id="confirm-password"
                                value={confirmPassword}
                                placeholder="Confirm your password" 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                className="border border-solid border-slate-200 rounded-sm w-full !px-1 !mt-1 focus:outline-none"   
                            />
                        </div>)
                    }
                </div>
            </section>
            <div className="flex flex-col justify-around w-full">
                <button className="flex items-center justify-center rounded-sm bg-black text-white !mb-2 w-full !py-1 cursor-pointer hover:bg-slate-700" onClick={() => handleAuthentication()}>{mode === LOGIN_MODE ? "Sign in" : "Sign up"}</button>
                {
                    mode === LOGIN_MODE &&
                    <p className="text-xs flex justify-center cursor-pointer">Forgot password?</p>
                }
            </div>
        </div>
    )
}

export default Login