"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "../auth.css";

export default function OTP(){
  const params=useSearchParams(); const email=params.get("email")||"yourname@gmail.com";
  const [otp,setOtp]=useState(""); const [seconds,setSeconds]=useState(45); const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const [resending,setResending]=useState(false);
  useEffect(()=>{if(seconds<=0)return;const t=setInterval(()=>setSeconds(s=>s-1),1000);return()=>clearInterval(t)},[seconds]);
  const verify=async(e)=>{e.preventDefault();setError("");setLoading(true);try{const r=await fetch("/api/otp/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({otp})});const d=await r.json();if(!r.ok)throw new Error(d.message||"OTP verification failed.");window.location.href="/dashboard";}catch(err){setError(err.message)}finally{setLoading(false)}};
  const resend=async(e)=>{e.preventDefault();if(seconds>0||resending)return;setError("");setResending(true);try{const r=await fetch("/api/otp/resend",{method:"POST"});const d=await r.json();if(!r.ok)throw new Error(d.message||"Could not resend OTP.");setSeconds(45);}catch(err){setError(err.message)}finally{setResending(false)}};
  return <main className="auth"><div className="authBox">
    <a href="/register" className="back">← Back to Create Account</a>
    <div className="otpIcon">✉</div><div className="made">🇮🇳 MADE IN INDIA</div>
    <h1>Verify Your Gmail</h1><p>Enter the 6-digit code sent to <b>{email}</b>.</p>
    <form onSubmit={verify}><label>6-Digit OTP<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" maxLength="6" placeholder="123456" required/></label>{error&&<div className="errorBox">{error}</div>}<button type="submit" disabled={loading}>{loading?"Verifying…":"Verify OTP"}</button></form>
    {seconds>0?<div className="otpMeta">Resend OTP in <b>00:{String(seconds).padStart(2,"0")}</b></div>:<div className="otpMeta">You can request a new OTP now.</div>}
    <a className={seconds>0||resending?"resend disabled":"resend"} href="#" onClick={resend}>{resending?"Sending…":"Resend OTP"}</a>
    <div className="notice">🔒 Never share your OTP with anyone.</div>
    <div className="switch">Wrong Gmail? <a href="/register">Change Gmail</a></div>
  </div></main>
}
