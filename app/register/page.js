"use client";
import { useState } from "react";
import "../auth.css";

export default function Register(){
  const [form,setForm]=useState({name:"",mobile:"",gmail:"",password:"",confirm:""});
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const submit=async(e)=>{e.preventDefault();setError("");
    if(form.password!==form.confirm){setError("Passwords do not match.");return;}
    setLoading(true);
    try{const r=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d.message||"Registration failed.");window.location.href="/otp?email="+encodeURIComponent(d.email);}catch(err){setError(err.message);}finally{setLoading(false);}
  };
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return <main className="auth"><div className="authBox wide">
    <a href="/" className="back">← CardSell</a>
    <h1>Create Your Account</h1><p>Start selling gift cards and access electricity bill offers.</p>
    <form className="form" onSubmit={submit}>
      <label>Full Name<input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Your full name" required/></label>
      <label>Mobile Number<input value={form.mobile} onChange={e=>set("mobile",e.target.value.replace(/\D/g,"").slice(0,10))} inputMode="numeric" placeholder="10-digit mobile number" required/></label>
      <label>Gmail Address<input value={form.gmail} onChange={e=>set("gmail",e.target.value)} type="email" placeholder="yourname@gmail.com" required/></label>
      <label>Password<input value={form.password} onChange={e=>set("password",e.target.value)} type="password" placeholder="Create a strong password" required/></label>
      <label>Confirm Password<input value={form.confirm} onChange={e=>set("confirm",e.target.value)} type="password" placeholder="Repeat your password" required/></label>
      {error && <div className="errorBox">{error}</div>}
      <button type="submit" disabled={loading}>{loading ? "Sending OTP…" : "Create Account & Send OTP →"}</button>
    </form>
    <div className="notice">A 6-digit OTP will be sent to your Gmail for verification.</div>
    <div className="switch">Already have an account? <a href="/login">Log in</a></div>
  </div></main>
}
