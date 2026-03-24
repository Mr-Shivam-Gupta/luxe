import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Lenis from 'lenis';

// Watch images from Unsplash (free, no auth needed)
const WATCHES = {
  heroVideo: '/assets/Rolex_Submariner_2022_Black_Blender_3d_Product_Animation_1080p.mp4',
  featureVideo: '/assets/2nd_section.mp4',
  heroImage: '/assets/hero.gif',
  hero2: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&q=80',
  collection: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
  watch1: 'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=400&q=80',
  watch2: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=400&q=80',
  watch3: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=400&q=80',
  watch4: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?w=400&q=80',
  watch5: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400&q=80',
  watch6: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80',
  brand: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
  brand2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  footer: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=500&q=80',
};

const SECTIONS = [
  'hero', 'video', 'landing', 'collection', 'why', 'signature', 'brand', 'craft', 'footer'
];

const products = [
  { name: 'Aurelius', size: '42mm', colors: '1 Colors', price: '₹14,588', img: WATCHES.watch1 },
  { name: 'Marlin', size: '40mm', colors: '2 Colors', price: '₹12,999', img: WATCHES.watch2 },
  { name: 'Legacy', size: '38mm', colors: '1 Colors', price: '₹16,200', img: WATCHES.watch3 },
  { name: 'Indiglo', size: '44mm', colors: '3 Colors', price: '₹9,899', img: WATCHES.watch4 },
];

export default function Home() {
  const containerRef = useRef(null);
  const lenisRef = useRef(null);
  const [visibleSections, setVisibleSections] = useState(new Set([0]));
  const [collectionSlide, setCollectionSlide] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize Lenis for smooth toggle-like scrolling
    const lenis = new Lenis({
      wrapper: container,
      content: container,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    // Custom smooth snap logic (sticky aware)
    let snapTimeout;
    const handleSnap = () => {
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        // Find closest section break
        // With sticky stacking, we want to snap to where the NEXT section starts revealing
        // OR where the current section is fully pinned.
        
        // Simpler approach: Snap to multiples of viewport height
        // Because sticky sections naturally stack at 0, 100vh, 200vh scroll positions.
        
        const scrollY = container.scrollTop;
        const vh = container.clientHeight;
        const snapPoint = Math.round(scrollY / vh) * vh;

        if (Math.abs(scrollY - snapPoint) > 5) {
           lenis.scrollTo(snapPoint, { 
             duration: 1.2,
             easing: (t) => 1 - Math.pow(1 - t, 4), // easeOutQuart
             lock: true 
           });
        }
      }, 150); // Wait for scroll to settle
    };

    lenis.on('scroll', handleSnap);

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Observer for active state
    const sections = container.querySelectorAll('.snap-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = parseInt(entry.target.dataset.index);
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, idx]));
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      lenis.destroy();
      observer.disconnect();
      clearTimeout(snapTimeout);
    };
  }, []);

  const scrollToSection = (idx) => {
    const container = containerRef.current;
    const sections = container.querySelectorAll('.snap-section');
    const target = sections[idx];
    if (target && lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 2.0 });
    } else if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isVisible = (idx) => visibleSections.has(idx);

  return (
    <>
      <Head>
        <title>LUXE — Crafted for Time</title>
        <meta name="description" content="Luxury watches crafted for those who value excellence." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Scroll snap container */}
      <div className="snap-container" ref={containerRef}>

        {/* ===== SECTION 0: HERO (watch close-up with "Crafted for Time") ===== */}
        <section className="snap-section hero-section" data-index="0">
          {/* Announcement bar */}
          <div className="announcement-bar">
            <div className="announcement-bar-track" aria-label="Promotional offer marquee">
              <div className="announcement-bar-content">
                Get 20% off using our coupon: <span>NEWUSER30</span>
              </div>
              <div className="announcement-bar-content" aria-hidden="true">
                Get 20% off using our coupon: <span>NEWUSER30</span>
              </div>
            </div>
          </div>
          {/* Navbar */}
          <nav className="navbar">
            <div className="nav-left">
              <a onClick={() => scrollToSection(3)}>Shop</a>
              <a onClick={() => scrollToSection(3)}>Collections</a>
              <a onClick={() => scrollToSection(3)}>New Arrivals</a>
            </div>
            <div className="nav-logo">LUXE</div>
            <div className="nav-right">
              <a onClick={() => scrollToSection(6)}>Story</a>
              <a onClick={() => scrollToSection(7)}>Craft</a>
              <a onClick={() => scrollToSection(8)}>Contact</a>
            </div>
          </nav>
          {/* Hero image */}
          <div className="hero-image-container">
            <video
              className="hero-video"
              src={WATCHES.heroVideo}
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="hero-image-overlay">
              <p className={`hero-tagline ${isVisible(0) ? 'animate-in animate-in-delay-2' : ''}`}>
                Crafted for Time.
              </p>
            </div>
          </div>
        </section>

        {/* ===== SECTION 1: FEATURE VIDEO ===== */}
        <section className="snap-section feature-video-section" data-index="1">
          <div className="hero-image-container feature-video-container">
            <video
              className={`hero-video feature-video ${isVisible(1) ? 'animate-in animate-in-delay-1' : ''}`}
              src={WATCHES.featureVideo}
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </section>

        {/* ===== SECTION 2: LANDING (Timeless Craft. Modern Legacy.) ===== */}
        <section className="snap-section landing-section" data-index="2">
          <div className={`landing-left ${isVisible(2) ? 'animate-in animate-in-delay-1' : ''}`}>
            <h1 className="landing-heading">
              Timeless Craft.<br />
              <em>Modern Legacy.</em>
            </h1>
            <p className="landing-body">
              Discover watches that don't just tell time — they define it. Precision-engineered,
              masterfully crafted, and designed for those who value excellence.
            </p>
            <a className="btn-shop" onClick={() => scrollToSection(3)}>SHOP NOW</a>
          </div>
          <div className={`landing-right ${isVisible(2) ? 'animate-in animate-in-delay-3' : ''}`}>
            <img src={WATCHES.hero2} alt="Gold luxury watch" />
          </div>
        </section>

        {/* ===== SECTION 3: NEW COLLECTION ===== */}
        <section className="snap-section collection-section" data-index="3">
          <div className="collection-inner">
            <div className={`collection-left ${isVisible(3) ? 'animate-in animate-in-delay-1' : ''}`}>
              <h2 className="section-label">New collection</h2>
              <img src={WATCHES.collection} alt="Man wearing luxury watch" />
            </div>
            <div className={`collection-right ${isVisible(3) ? 'animate-in animate-in-delay-2' : ''}`}>
              <div className="top-picks-header">
                <h3 className="top-picks-title">Top Picks</h3>
                <div className="arrow-btns">
                  <button className="arrow-btn" onClick={() => setCollectionSlide(s => Math.max(0, s - 1))}>→</button>
                  <button className="arrow-btn" onClick={() => setCollectionSlide(s => Math.min(products.length - 2, s + 1))}>←</button>
                </div>
              </div>
              <div className="products-grid">
                {products.slice(collectionSlide, collectionSlide + 2).map((p, i) => (
                  <div className="product-card" key={i}>
                    <div className="product-card-img">
                      <img src={p.img} alt={p.name} />
                    </div>
                    <div className="product-card-info">
                      <div className="product-name-row">
                        <span className="product-name">{p.name}</span>
                        <span className="heart-icon">♡</span>
                      </div>
                      <div className="product-meta">{p.size} | {p.colors}</div>
                      <div className="product-price">{p.price}</div>
                    </div>
                    <button className="btn-buy">BUY NOW</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 4: WHY CHOOSE US ===== */}
        <section className="snap-section why-section" data-index="4">
          <img className="why-bg" src={WATCHES.heroImage} alt="Why choose us background" />
          <div className="why-content">
            <p className={`why-label ${isVisible(4) ? 'animate-in animate-in-delay-1' : ''}`}>
              WHY CHOOSE US
            </p>
            <h2 className={`why-title ${isVisible(4) ? 'animate-in animate-in-delay-2' : ''}`}>
              Crafted for Time.
            </h2>
            <p className={`why-body ${isVisible(4) ? 'animate-in animate-in-delay-3' : ''}`}>
              Experience the harmony of design and precision. Every curve, every component,
              and every detail is crafted to deliver unmatched elegance and performance.
            </p>
          </div>
        </section>

        {/* ===== SECTION 5: SIGNATURE COLLECTION ===== */}
        <section className="snap-section signature-section" data-index="5">
          <div className="signature-header">
            <h2 className={`signature-title ${isVisible(5) ? 'animate-in animate-in-delay-1' : ''}`}>
              The <span className="muted">Signature</span><br />Collection
            </h2>
            <p className={`signature-desc ${isVisible(5) ? 'animate-in animate-in-delay-2' : ''}`}>
              We believe a watch is more than an accessory — it is a legacy worn on the wrist.
              Every timepiece we offer is crafted with meticulous attention to detail, combining
              heritage craftsmanship with modern innovation.
            </p>
          </div>
          <div className={`signature-grid ${isVisible(5) ? 'animate-in animate-in-delay-3' : ''}`}>
            {[
              { name: 'The Royal Series', desc: 'Crafted for those who carry legacy with effortless authority.', img: WATCHES.watch5 },
              { name: 'Midnight Edition', desc: 'Bold in darkness, refined in every detail.', img: WATCHES.watch3 },
              { name: 'Classic Heritage', desc: 'Where timeless design meets enduring craftsmanship.', img: WATCHES.watch4 },
            ].map((item, i) => (
              <div className="sig-card" key={i}>
                <div className="sig-card-img">
                  <img src={item.img} alt={item.name} />
                </div>
                <h3 className="sig-card-name">{item.name}</h3>
                <p className="sig-card-desc">{item.desc}</p>
                <button className="btn-buy-outline">BUY NOW</button>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 6: BRAND STORY ===== */}
        <section className="snap-section brand-section" data-index="6">
          <div className="brand-header">
            <h2 className={`brand-title ${isVisible(6) ? 'animate-in animate-in-delay-1' : ''}`}>
              BRAND <span className="muted">STORY</span>
            </h2>
            <p className={`brand-desc ${isVisible(6) ? 'animate-in animate-in-delay-2' : ''}`}>
              Born from a passion for perfection, our brand stands at the intersection of
              tradition and innovation. Each watch is a reflection of timeless artistry,
              designed for individuals who appreciate sophistication, precision, and enduring style.
              We don't just create watches — we craft moments that last forever.
            </p>
          </div>

          {/* Main brand image with ELEGANT overlay */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: 0 }}>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
              <img src={WATCHES.brand} alt="Brand story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '80px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.05em',
                  userSelect: 'none'
                }}>ELEGANT</span>
              </div>
            </div>

            {/* Right: stacked word art */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', paddingLeft: '16px' }}>
              {['TIMELESS', 'REFINED', 'PRESTIGE', 'HERITAGE'].map((word, i) => (
                <div
                  key={word}
                  className={isVisible(6) ? 'animate-in' : ''}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '60px',
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                    animationDelay: `${0.1 * (i + 1)}s`,
                    opacity: isVisible(6) ? undefined : 0,
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 7: CRAFTSMANSHIP ===== */}
        <section className="snap-section craft-section" data-index="7">
          <div className="craft-header">
            <h2 className={`craft-title ${isVisible(7) ? 'animate-in animate-in-delay-1' : ''}`}>
              CRAFTSMANSHIP <span className="muted">SECTION</span>
            </h2>
            <p className={`craft-desc ${isVisible(7) ? 'animate-in animate-in-delay-2' : ''}`}>
              Our watches are assembled with precision using world-class materials and
              cutting-edge techniques. From intricate movements to hand-finished detailing,
              every piece undergoes rigorous quality checks to ensure flawless performance.
            </p>
          </div>
          <div className={`craft-grid ${isVisible(7) ? 'animate-in animate-in-delay-3' : ''}`}>
            {products.map((p, i) => (
              <div className="product-card" key={i}>
                <div className="product-card-img">
                  <img src={p.img} alt={p.name} />
                </div>
                <div className="product-card-info">
                  <div className="product-name-row">
                    <span className="product-name">{p.name}</span>
                    <span className="heart-icon">♡</span>
                  </div>
                  <div className="product-meta">{p.size} | {p.colors}</div>
                  <div className="product-price">{p.price}</div>
                </div>
                <button className="btn-buy">BUY NOW</button>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 8: FOOTER ===== */}
        <section className="snap-section footer-section" data-index="8">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">LUXE</div>
              <p className="footer-tagline">Crafted for Those Who Value Time.</p>
              <img className="footer-img" src={WATCHES.footer} alt="Watch mechanism" />
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                {['Home', 'Watches', 'Collections', 'New Arrivals', 'Limited Editions', 'About Us', 'Contact'].map(link => (
                  <li key={link}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Customer Care</h4>
              <ul>
                {['Help Center', 'Shipping & Delivery', 'Returns & Exchanges', 'Warranty', 'Track Your Order'].map(link => (
                  <li key={link}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Discover</h4>
              <ul>
                {['Craftsmanship', 'Our Story', 'Journal', 'Store Locator'].map(link => (
                  <li key={link}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            {['📷', 'f', '💬', '✕'].map((icon, i) => (
              <a key={i} className="social-icon" href="#">{icon}</a>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
