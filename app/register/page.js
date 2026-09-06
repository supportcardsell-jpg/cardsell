import "../auth.css";
export default function Register(){return <main className="auth"><div className="authBox wide">
<a href="/" className="back">← CardSell</a>
<h1>Create Your Account</h1><p>Start selling gift cards and access electricity bill offers.</p>
<div className="form">
<label>Full Name<input placeholder="Your full name"/></label>
<label>Mobile Number<input inputMode="numeric" placeholder="10-digit mobile number"/></label>
<label>Gmail Address<input type="email" placeholder="yourname@gmail.com"/></label>
<label>Password<input type="password" placeholder="Create a strong password"/></label>
<label>Confirm Password<input type="password" placeholder="Repeat your password"/></label>
<a className="buttonLink" href="/otp">Create Account &amp; Send OTP <span>→</span></a>
</div>
<div className="notice">A 6-digit OTP will be sent to your Gmail for verification.</div>
<div className="switch">Already have an account? <a href="/login">Log in</a></div>
</div></main>}