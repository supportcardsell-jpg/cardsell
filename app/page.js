const stats=[['10K+','Happy Users'],['4.8/5','User Rating'],['100%','Secure Platform'],['24/7','Support']];
const steps=[['01','Create Account','Sign up with your mobile number and Gmail.'],['02','See Live Requirements','View only the gift cards CardSell currently needs.'],['03','Submit Your Card','Enter your card details and send it for review.'],['04','Get Paid Directly','After approval, receive payment on your UPI.']];
const benefits=['Direct UPI / QR payouts','Admin-controlled requirements','Clear order tracking','Fraud warning & review','Electricity bill offers','Support & dispute tickets'];
export default function Home(){return <main>
 <div className="tricolor"><span/><span/><span/></div>
 <header><a className="logo" href="#home"><b>Card</b><strong>Sell</strong><small>Sell Gift Cards | Earn Instantly</small></a>
  <nav><a href="#home">Home</a><a href="#how">How It Works</a><a href="#requirements">Requirements</a><a href="#benefits">Benefits</a></nav>
  <div className="actions"><a className="login" href="/login">Login</a><a className="primary" href="/register">Create Account</a></div>
 </header>
 <section id="home" className="hero"><div className="heroText">
   <div className="indiaBadge"><span className="chakra">✦</span><div><b>MADE IN INDIA</b><small>Indian-first • UPI powered</small></div></div>
   <div className="eyebrow">🇮🇳 PROUDLY INDIAN • SIMPLE • TRANSPARENT</div>
   <h1>Turn Your Gift Cards<br/><em>into Real Cash.</em></h1>
   <p className="lead">Sell gift cards that are currently required by CardSell and get paid directly to your UPI after verification.</p>
   <div className="heroBtns"><a className="primary big" href="/register">Start Selling Gift Cards <span>→</span></a><a className="secondary big" href="#how">See How It Works</a></div>
   <div className="trustRow"><span>✓ No wallet required</span><span>✓ Direct UPI payout</span><span>✓ Clear status tracking</span></div>
 </div><div className="visual">
   <div className="orbit orbit1"/><div className="orbit orbit2"/>
   <div className="indiaGlow"><small>MADE FOR</small><b>INDIA</b><span>🇮🇳</span></div>
   <div className="card"><div className="cardTop"><small>GIFT CARD</small><span>CARDSell</span></div><b>₹1,000</b><small className="cardBottom">READY TO SELL</small></div>
   <div className="upi"><span className="upiIcon">↗</span><div><b>UPI PAYMENT</b><small>Direct to your UPI</small></div></div>
   <div className="secure"><span>✓</span><div><b>Secure Review</b><small>Verified before payout</small></div></div>
 </div></section>
 <section className="indiaStrip"><div><span>🇮🇳</span><b>Made in India</b><small>Built for Indian users</small></div><div><span>UPI</span><b>Direct Payments</b><small>No wallet balance</small></div><div><span>🔒</span><b>Secure & Clear</b><small>Every order tracked</small></div></section>
 <section className="stats">{stats.map(s=><div key={s[1]}><b>{s[0]}</b><span>{s[1]}</span></div>)}</section>
 <section id="how" className="section"><div className="sectionHead"><span>HOW CARDSELL WORKS</span><h2>From card to cash, simply.</h2><p>A straightforward process with clear requirements and direct payouts.</p></div><div className="steps">{steps.map(x=><div className="step" key={x[0]}><i>{x[0]}</i><h3>{x[1]}</h3><p>{x[2]}</p><span className="stepArrow">↗</span></div>)}</div></section>
 <section id="requirements" className="darkSection"><div className="sectionHead"><span>LIVE REQUIREMENTS</span><h2>Sell what CardSell needs.</h2><p>Admin creates the requirement. Users see only active requirements and their remaining amount.</p></div><div className="reqCard"><div className="reqMain"><div className="reqLabel"><span className="liveDot"/> ACTIVE REQUIREMENT</div><h3>Amazon Gift Card</h3><p>Required total <b>₹10,000</b> · Example buy rate <b>96%</b></p><div className="reqMeta"><span>Min discount: 3%</span><span>Direct UPI payout</span></div></div><div className="progress"><div className="progressHead"><b>₹0</b><span>of ₹10,000 received</span></div><div className="bar"><span/></div><small>Remaining requirement updates automatically after approved sales.</small></div></div></section>
 <section id="benefits" className="section benefits"><div className="benefitIntro"><span>WHY CARDSELL</span><h2>Built around trust.</h2><p>Everything is designed around the way Indian users actually sell, receive and track payments.</p><a className="outline" href="/register">Create your account →</a></div><div className="benefitGrid">{benefits.map(x=><div key={x}><span>✓</span><b>{x}</b></div>)}</div></section>
 <section className="indiaClosing"><div><span>🇮🇳</span><div><small>MADE IN INDIA</small><h2>Built for India. Built around UPI.</h2><p>CardSell brings gift-card selling and electricity bill opportunities together in one simple platform.</p></div></div><a className="primary" href="/register">Join CardSell</a></section>
 <footer><div className="logo"><b>Card</b><strong>Sell</strong><small>Sell Gift Cards | Earn Instantly</small></div><p>© 2026 CardSell. Made in India.</p><div><a href="/login">Login</a> · <a href="/register">Create Account</a> · Privacy · Terms · Support</div></footer>
 </main>}
