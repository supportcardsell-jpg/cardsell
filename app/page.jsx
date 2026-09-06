import Link from "next/link";
import "./styles.css";
export default function Login(){
 return <main className="page">
  <div className="flag"><span></span><span></span><span></span></div>
  <section className="shell">
   <Link href="/" className="logo"><b>₹</b><div><strong>CardSell</strong><small>Sell Gift Cards • Earn Instantly</small></div></Link>
   <div className="card">
    <div className="badge">🇮🇳 MADE IN INDIA</div>
    <h1>Welcome Back</h1>
    <p className="sub">Sign in to continue to your CardSell account.</p>
    <form>
      <label>Gmail Address</label>
      <input type="email" placeholder="you@gmail.com"/>
      <label>Password</label>
      <div className="pass"><input id="password" type="password" placeholder="Enter your password"/><button type="button" onClick={()=>{const x=document.getElementById("password");x.type=x.type==="password"?"text":"password"}}>Show</button></div>
      <div className="row"><label className="remember"><input type="checkbox"/> Remember me</label><a href="#">Forgot Password?</a></div>
      <button className="login" type="submit">Login <span>→</span></button>
    </form>
    <div className="or"><i></i><span>Secure access</span><i></i></div>
    <p className="signup">Don't have an account? <Link href="/register">Create Account</Link></p>
   </div>
   <footer>© 2026 CardSell • Privacy • Terms • Support</footer>
  </section>
 </main>
}