"use client";
import { useEffect, useState } from "react";
import "../../auth.css";

export default function AdminLogin(){
  const [gmail,setGmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    fetch("/api/admin/me",{cache:"no-store"})
      .then(r=>r.json())
      .then(d=>{ if(d.authenticated) window.location.href="/admin"; })
      .catch(()=>{});
  },[]);

  async function go(e){
    e.preventDefault(); setError(""); setLoading(true);
    try{
      const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gmail,password})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.message||"Admin login failed.");
      window.location.href="/admin";
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }

  return <main className="auth"><div className="authBox">
    <a href="/" className="back">← CardSell</a>
    <div className="indiaPill" style={{marginTop:18}}><span>🇮🇳</span><div><b>ADMIN ACCESS</b><small>Secure control center</small></div></div>
    <h1>Admin Login</h1><p>Sign in with your CardSell Admin account.</p>
    <form onSubmit={go}>
      <label>Admin Gmail<input value={gmail} onChange={e=>setGmail(e.target.value)} type="email" placeholder="admin@gmail.com" autoComplete="username" required/></label>
      <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" autoComplete="current-password" required/></label>
      {error&&<div className="errorBox">{error}</div>}
      <button type="submit" disabled={loading}>{loading?"Signing in…":"Login as Admin"}</button>
    </form>
    <div className="switch"><a href="/login">← User Login</a></div>
  </div></main>
}
