"use client";
import { useState } from "react";
import "../auth.css";
export default function Login(){
 const [gmail,setGmail]=useState("");const [password,setPassword]=useState("");const [error,setError]=useState("");const [loading,setLoading]=useState(false);
 const go=async(e)=>{e.preventDefault();setError("");setLoading(true);try{const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gmail,password})});const d=await r.json();if(!r.ok)throw new Error(d.message||"Login failed.");window.location.href="/dashboard";}catch(err){setError(err.message)}finally{setLoading(false)}};
 return <main className="auth"><div className="authBox">
  <a href="/" className="back">← CardSell</a><h1>Welcome Back</h1><p>Sign in to continue to your account.</p>
  <form onSubmit={go}>
   <label>Gmail<input value={gmail} onChange={e=>setGmail(e.target.value)} type="email" placeholder="yourname@gmail.com" required/></label>
   <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" required/></label>
   <div className="row"><label className="check"><input type="checkbox"/> Remember me</label><a href="#">Forgot Password?</a></div>
   {error&&<div className="errorBox">{error}</div>}
   <button type="submit" disabled={loading}>{loading?"Signing in…":"Login"}</button>
  </form>
  <div className="switch">Don't have an account? <a href="/register">Create Account</a></div>
 </div></main>
}
