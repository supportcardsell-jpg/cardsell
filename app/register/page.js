"use client";
import "../auth.css";
export default function Register(){
 const go=(e)=>{e.preventDefault(); window.location.href="/otp";};
 return <main className="auth"><div className="authBox wide">
  <a href="/" className="back">← CardSell</a>
  <h1>Create Your Account</h1>
  <p>Start selling gift cards and access electricity bill offers.</p>
  <form onSubmit={go}>
   <label>Full Name<input placeholder="Your full name" required/></label>
   <label>Mobile Number<input inputMode="numeric" placeholder="10-digit mobile number" required/></label>
   <label>Gmail Address<input type="email" placeholder="yourname@gmail.com" required/></label>
   <label>Password<input type="password" placeholder="Create a strong password" required/></label>
   <label>Confirm Password<input type="password" placeholder="Repeat your password" required/></label>
   <button type="submit">Create Account & Send OTP</button>
  </form>
  <div className="notice">A 6-digit OTP will be sent to your Gmail for verification.</div>
  <div className="switch">Already have an account? <a href="/login">Log in</a></div>
 </div></main>
}