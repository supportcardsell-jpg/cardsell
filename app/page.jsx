import "./styles.css";
export default function OTP(){
 return <main className="page">
  <div className="flag"><span></span><span></span><span></span></div>
  <section className="shell">
   <a className="logo" href="/"><b>₹</b><div><strong>CardSell</strong><small>Sell Gift Cards • Earn Instantly</small></div></a>
   <div className="card">
    <div className="icon">✉</div>
    <div className="badge">🇮🇳 MADE IN INDIA</div>
    <h1>Verify Your Gmail</h1>
    <p className="sub">We've sent a 6-digit verification code to<br/><strong>yourname@gmail.com</strong></p>
    <label className="title">Enter OTP</label>
    <div className="otp">
      <input maxLength="1" inputMode="numeric"/><input maxLength="1" inputMode="numeric"/><input maxLength="1" inputMode="numeric"/><input maxLength="1" inputMode="numeric"/><input maxLength="1" inputMode="numeric"/><input maxLength="1" inputMode="numeric"/>
    </div>
    <button className="verify">Verify OTP <span>→</span></button>
    <div className="timer">Resend OTP in <strong>00:45</strong></div>
    <button className="resend">Resend OTP</button>
    <p className="change">Wrong email? <a href="/register">Change Gmail</a></p>
    <div className="secure">🔒 Your verification code is private and should never be shared.</div>
   </div>
   <footer>© 2026 CardSell • Privacy • Terms • Support</footer>
  </section>
 </main>
}