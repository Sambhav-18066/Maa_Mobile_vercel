import Link from "next/link";

export default function Home(){
  return (
    <main style={{maxWidth:1000, margin:"16px auto", padding:"0 16px"}}>
      <nav className="categories">
        {/* SUBCATS */}
        <div className="subcats">
          <div className="subcat">
            <div className="title">Mobile Phone</div>
            <div className="chips">
              <a className="chip" href="/search?q=smartphone">Smart phone</a>
              <a className="chip" href="/search?q=feature phone">Feature phones</a>
              <a className="chip" href="/search?q=Samsung">Samsung</a>
              <a className="chip" href="/search?q=Apple">Apple</a>
              <a className="chip" href="/search?q=Lava">Lava</a>
              <a className="chip" href="/search?q=Itel">Itel</a>
              <a className="chip" href="/search?q=HMD Nokia">HMD (Nokia)</a>
            </div>
          </div>
          <div className="subcat">
            <div className="title">Accessories</div>
            <div className="chips">
              <a className="chip" href="/search?q=charger">charger</a>
              <a className="chip" href="/search?q=cables">cables</a>
              <a className="chip" href="/search?q=aux">aux cords</a>
              <a className="chip" href="/search?q=sd card">sd cards</a>
              <a className="chip" href="/search?q=cover">cover</a>
              <a className="chip" href="/search?q=earphones">earphones</a>
              <a className="chip" href="/search?q=headphones">headphones</a>
              <a className="chip" href="/search?q=bluetooth speaker">bluetooth speakers</a>
            </div>
          </div>
          <div className="subcat">
            <div className="title">LPG</div>
            <div className="chips">
              <a className="chip" href="/search?q=Bharat Gas cylinder">book Bharat cylinder</a>
              <a className="chip" href="/search?q=Indane cylinder">book Indane cylinder</a>
              <a className="chip" href="/search?q=lpg pipe">lpg home pipe</a>
              <a className="chip" href="/search?q=lpg regulator">regulator</a>
              <a className="chip" href="/search?q=gas stove">gas stove</a>
              <a className="chip" href="/search?q=lpg fittings">fittings</a>
            </div>
          </div>
          <div className="subcat">
            <div className="title">Electronics</div>
            <div className="chips">
              <a className="chip" href="/search?q=switches">switches</a>
              <a className="chip" href="/search?q=lights">lights</a>
              <a className="chip" href="/search?q=modular switches">modular switches</a>
              <a className="chip" href="/search?q=door bell">door bells</a>
              <a className="chip" href="/search?q=tube light">tube light</a>
              <a className="chip" href="/search?q=wires">wires</a>
            </div>
          </div>
          <div className="subcat">
            <div className="title">Home Appliances</div>
            <div className="chips">
              <a className="chip" href="/search?q=tv">tv</a>
              <a className="chip" href="/search?q=fridge">fridge</a>
              <a className="chip" href="/search?q=ac">ac</a>
              <a className="chip" href="/search?q=ceiling fan">ceiling fan</a>
              <a className="chip" href="/search?q=table fan">table fan</a>
              <a className="chip" href="/search?q=induction">induction</a>
              <a className="chip" href="/search?q=water heater">water heater</a>
              <a className="chip" href="/search?q=kettle">kettle</a>
              <a className="chip" href="/search?q=home theater">home theater</a>
              <a className="chip" href="/search?q=soundbar">sound bar</a>
            </div>
          </div>
        </div>
      </nav>
      <section style={{marginTop:12}}>
        <Link className="btn primary" href="/search?q=smartphone">Browse smartphones</Link>
      </section>
    </main>
  );
}
