import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Lenis from 'lenis';
import { motion, useScroll, useTransform } from 'framer-motion';
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

import { useMotionValue } from 'framer-motion';

export default function Home() {
  const containerRef = useRef(null);
  const lenisRef = useRef(null);
  const collectionRef = useRef(null);
  const [visibleSections, setVisibleSections] = useState(new Set([0]));
  const [collectionSlide, setCollectionSlide] = useState(0);
  const [craftSlide, setCraftSlide] = useState(0);
  const [isHero, setIsHero] = useState(true);
  const topPicksTrackRef = useRef(null);
  const craftTrackRef = useRef(null);
  const craftViewportRef = useRef(null);   // NEW: to measure pixel width
  const [craftPx, setCraftPx] = useState(0); // pixel width of one craft page
  const topPicksTimerRef = useRef(null);
  const craftTimerRef = useRef(null);
  const topPicksRestartRef = useRef(null);
  const craftRestartRef = useRef(null);

  // Measure craft viewport width (pixel-precise, no % ambiguity)
  useEffect(() => {
    const measure = () => {
      if (craftViewportRef.current) setCraftPx(craftViewportRef.current.clientWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const TP_COUNT = products.length - 1; // 3 stops (shows 2 cards at a time)
  const CR_PAGES  = 3;                   // 3 identical pages — same 4 cards each
  const [crInstant, setCrInstant] = useState(false);

  // Start / restart Top Picks auto-loop
  const startTopPicks = () => {
    clearInterval(topPicksTimerRef.current);
    topPicksTimerRef.current = setInterval(() => {
      setCollectionSlide(s => (s + 1) % TP_COUNT);
    }, 3000);
  };

  // Start / restart Craft auto-loop (just increment; onAnimationComplete handles the reset)
  const startCraft = () => {
    clearInterval(craftTimerRef.current);
    craftTimerRef.current = setInterval(() => {
      setCraftSlide(s => s + 1);
    }, 3200);
  };

  // Pause then restart after manual interaction
  const pauseAndRestartTopPicks = () => {
    clearInterval(topPicksTimerRef.current);
    clearTimeout(topPicksRestartRef.current);
    topPicksRestartRef.current = setTimeout(startTopPicks, 2000);
  };
  const pauseAndRestartCraft = () => {
    clearInterval(craftTimerRef.current);
    clearTimeout(craftRestartRef.current);
    craftRestartRef.current = setTimeout(startCraft, 2000);
  };

  useEffect(() => { startTopPicks(); return () => { clearInterval(topPicksTimerRef.current); clearTimeout(topPicksRestartRef.current); }; }, []);
  useEffect(() => { startCraft(); return () => { clearInterval(craftTimerRef.current); clearTimeout(craftRestartRef.current); }; }, []);

  const collProgress = useMotionValue(0);

  // Phase 1 (0 → 0.45): image is FULL PAGE — fades in + zooms in from scale 1.12 → 1
  // Phase 2 (0.45 → 1): image shrinks and settles into the left column
  const imgOpacity = useTransform(collProgress, [0, 0.3], [0, 1]);
  const imgScale = useTransform(collProgress, [0, 0.45], [1.12, 1]);
  const imgWidth = useTransform(collProgress, [0.45, 1], ["100%", "48%"]);
  const imgHeight = useTransform(collProgress, [0.45, 1], ["100%", "88%"]);
  const imgTop = useTransform(collProgress, [0.45, 1], ["0%", "11%"]);
  const imgRadius = useTransform(collProgress, [0.45, 1], ["0px", "12px"]);
  const textOpacity = useTransform(collProgress, [0.75, 1], [0, 1]);
  const rightOpacity = useTransform(collProgress, [0.75, 1], [0, 1]);
  const rightX = useTransform(collProgress, [0.75, 1], [40, 0]);

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

    lenis.on('scroll', () => {
      // Custom smooth snap logic
      handleSnap();

      // Frame-accurate manual progress driver for Framer Motion 'New Collection'
      const scrollY = container.scrollTop;
      const vh = container.clientHeight;
      if (vh) {
        const start = 3 * vh;
        const end = 5 * vh;
        let progress = 0;
        if (scrollY <= start) progress = 0;
        else if (scrollY >= end) progress = 1;
        else progress = (scrollY - start) / (end - start);
        collProgress.set(progress);

        // Hide header marquee if not actively traversing at top
        if (scrollY > 20) setIsHero(false);
        else setIsHero(true);
      }
    });

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
          if (!entry.target.dataset.index) return;
          const idx = parseInt(entry.target.dataset.index);
          if (entry.isIntersecting && !isNaN(idx)) {
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
    const target = container.querySelector(`[data-index="${idx}"]`);
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

      {/* Standard Layout with Fixed Header Space */}
      <div className="app-layout">
        <header className="global-header">
          {/* Announcement bar */}
          <motion.div
            style={{ overflow: 'hidden' }}
            initial={false}
            animate={{
              height: isHero ? 'auto' : 0,
              opacity: isHero ? 1 : 0
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
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
          </motion.div>
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
        </header>

        {/* Scroll snap container */}
        <div className="snap-container" ref={containerRef}>

          {/* ===== SECTION 0: HERO (watch close-up with "Crafted for Time") ===== */}
          <section className="snap-section hero-section" data-index="0">
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
          <section
            className="snap-section collection-section"
            data-index="3"
          >
            <div className="collection-inner" style={{ position: 'relative' }}>
              {/* Phase 1: full-page cinematic reveal. Phase 2: settles to left column */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: imgTop,
                  left: 0,
                  width: imgWidth,
                  height: imgHeight,
                  borderRadius: imgRadius,
                  overflow: 'hidden',
                  opacity: imgOpacity,
                  zIndex: 5,
                }}
              >
                <motion.img
                  src={WATCHES.collection}
                  alt="Man wearing luxury watch"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    scale: imgScale,
                    transformOrigin: 'center center',
                  }}
                />
              </motion.div>
              <div className="collection-left" style={{ position: 'relative', minHeight: 0, zIndex: 10 }}>
                <motion.h2 className="section-label" style={{ opacity: textOpacity }}>New collection</motion.h2>
              </div>
              <motion.div
                className="collection-right"
                style={{
                  opacity: rightOpacity,
                  x: rightX,
                  minHeight: 0,
                  zIndex: 10
                }}
              >
                <div className="top-picks-header">
                  <h3 className="top-picks-title">Top Picks</h3>
                  <div className="arrow-btns">
                    <button className="arrow-btn" onClick={() => {
                      setCollectionSlide(s => (s - 1 + TP_COUNT) % TP_COUNT);
                      pauseAndRestartTopPicks();
                    }}>←</button>
                    <button className="arrow-btn" onClick={() => {
                      setCollectionSlide(s => (s + 1) % TP_COUNT);
                      pauseAndRestartTopPicks();
                    }}>→</button>
                  </div>
                </div>
                {/* Drag carousel — 2 cards visible, infinite loop */}
                <div className="carousel-viewport">
                  <motion.div
                    ref={topPicksTrackRef}
                    className="carousel-track"
                    drag="x"
                    dragConstraints={{ left: -(TP_COUNT * 200), right: 0 }}
                    animate={{ x: `calc(${collectionSlide} * (-50% - 8px))` }}
                    transition={{ type: 'spring', stiffness: 320, damping: 36 }}
                    onDragEnd={(_, info) => {
                      const threshold = 50;
                      if (info.offset.x < -threshold) setCollectionSlide(s => (s + 1) % TP_COUNT);
                      else if (info.offset.x > threshold) setCollectionSlide(s => (s - 1 + TP_COUNT) % TP_COUNT);
                      pauseAndRestartTopPicks();
                    }}
                    style={{ cursor: 'grab' }}
                  >
                    {products.map((p, i) => (
                      <div className="carousel-card product-card" key={i} style={{ flexShrink: 0, width: 'calc(50% - 8px)' }}>
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
                  </motion.div>
                </div>
                {/* Dot indicators */}
                <div className="carousel-dots">
                  {Array.from({ length: TP_COUNT }).map((_, i) => (
                    <button key={i} className={`carousel-dot${collectionSlide === i ? ' active' : ''}`}
                      onClick={() => { setCollectionSlide(i); pauseAndRestartTopPicks(); }} />
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Fake transparent spacers to generate the scroll-stops for the animation */}
          <section className="snap-section" style={{ opacity: 0, pointerEvents: 'none', zIndex: 31 }} />
          <section className="snap-section" style={{ opacity: 0, pointerEvents: 'none', zIndex: 32 }} />

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
                { name: 'The Royal Series', desc: 'Crafted for those who carry legacy with effortless authority.', img: WATCHES.watch5, tag: 'Limited' },
                { name: 'Midnight Edition', desc: 'Bold in darkness, refined in every detail.', img: WATCHES.watch3, tag: 'Signature' },
                { name: 'Classic Heritage', desc: 'Where timeless design meets enduring craftsmanship.', img: WATCHES.watch4, tag: 'Heritage' },
              ].map((item, i) => (
                <div className="sig-card" key={i}>
                  <div className="sig-card-img">
                    <img src={item.img} alt={item.name} />
                    <span className="sig-tag">{item.tag}</span>
                  </div>
                  <h3 className="sig-card-name">{item.name}</h3>
                  <p className="sig-card-desc">{item.desc}</p>
                  <button className="btn-buy-outline">EXPLORE COLLECTION</button>
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
            {/* All 4 cards shown per page — pixel-accurate slide, zero blank space */}
            <div
              ref={craftViewportRef}
              className={`carousel-viewport craft-carousel-viewport ${isVisible(7) ? 'animate-in animate-in-delay-3' : ''}`}
            >
              <motion.div
                ref={craftTrackRef}
                className="carousel-track craft-track-nogap"
                drag="x"
                dragConstraints={{ left: -600, right: 600 }}
                animate={{ x: craftPx ? craftSlide * -craftPx : 0 }}
                transition={crInstant
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 280, damping: 34 }}
                onAnimationComplete={() => {
                  if (craftSlide >= CR_PAGES - 1) {
                    setCrInstant(true);
                    setCraftSlide(0);
                  } else if (craftSlide < 0) {
                    setCrInstant(true);
                    setCraftSlide(CR_PAGES - 2);
                  } else {
                    setCrInstant(false);
                  }
                }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) setCraftSlide(s => s + 1);
                  else if (info.offset.x > 50) setCraftSlide(s => Math.max(0, s - 1));
                  pauseAndRestartCraft();
                }}
                style={{ cursor: 'grab' }}
              >
                {Array.from({ length: CR_PAGES }).map((_, pi) => (
                  // Pixel width ensures perfect alignment — no blank gaps
                  <div key={pi} className="craft-page" style={{ width: craftPx || '100%' }}>
                    {products.map((p, j) => (
                      <div className="product-card" key={j}>
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
                ))}
              </motion.div>
            </div>
          </section>

          {/* ===== SECTION 8: FOOTER ===== */}
          <section className="snap-section footer-section" data-index="8">
            <div className="footer-top">
              <div className="footer-brand">
                <h3 className="footer-logo">LUXE</h3>
                <img className="footer-logo-img" src="/assets/footer_logo.png" alt="LUXE Logo" />
                <p className="footer-tagline">Crafted for Those Who Value Time.</p>
                {/* <img className="footer-img" src={WATCHES.footer} alt="Watch mechanism" /> */}
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
              <div className="copyright">
                <span>&copy; {new Date().getFullYear()} LUXE Watches. All rights reserved.</span>
                <div className="footer-bottom-links">
                  <a href="#">Privacy Policy</a>
                  <a href="#">Terms of Service</a>
                </div>
              </div>
              <div className="social-icons">
                <a className="social-icon" href="#">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.4 5.6 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.6 18.4 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25zM12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>
                </a>
                <a className="social-icon" href="#">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99h-2.54V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.25 0-1.64.78-1.64 1.57V12h2.82l-.45 2.89h-2.37v6.99C18.34 21.13 22 16.99 22 12c0-5.52-4.48-10-10-10z" /></svg>
                </a>
                <a className="social-icon" href="#">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 2.016H12c-5.518 0-10.005 4.5-10.01 10.024-.002 1.77.465 3.5 1.35 5.022L2 22.05l5.127-1.345a9.965 9.965 0 0 0 4.896 1.272h.005c5.519 0 10.006-4.5 10.01-10.024A9.957 9.957 0 0 0 12.031 2.016zM17.15 14.65c-.282.78-1.579 1.48-2.181 1.516-.549.034-1.229-.168-3.32-1.041-2.58-1.077-4.22-3.708-4.347-3.874-.128-.168-1.037-1.378-1.037-2.628 0-1.25.642-1.87 1.002-2.164.298-.242.748-.344 1.135-.344.159 0 .313.01.455.016.353.015.534.037.766.58.293.687.95 2.308 1.035 2.482.086.173.18.423.042.695-.138.272-.25.378-.44.577-.197.208-.415.441-.58.625-.183.203-.385.429-.168.793.216.363.953 1.554 2.035 2.62 1.393 1.373 2.502 1.745 2.879 1.895.378.15.65.125.865-.084.286-.275 1.075-1.29 1.365-1.733.29-.444.606-.356.963-.207.357.149 2.259 1.055 2.646 1.255.385.198.643.297.737.465.093.167.093.978-.189 1.758z" /></svg>
                </a>
                <a className="social-icon" href="#">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.95H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
