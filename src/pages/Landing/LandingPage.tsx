import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TOOLS = [
  { name: 'Sherlock', icon: '🔍', desc: 'Username hunting across 300+ platforms' },
  { name: 'PhoneInfoga', icon: '📡', desc: 'Deep carrier & telecom intelligence' },
  { name: 'WhatsApp Intel', icon: '💬', desc: 'Profile & business classification' },
  { name: 'Holehe / Mosint', icon: '📧', desc: 'Email footprint & breach detection' },
  { name: 'Nmap', icon: '🛰️', desc: 'Network topology & port recon' },
  { name: 'Whois', icon: '🌐', desc: 'Domain ownership intelligence' },
  { name: 'ExifTool', icon: '🖼️', desc: 'Metadata forensic extraction' },
  { name: 'AI Reports', icon: '🤖', desc: 'Gemini AI relationship graph & dossier' },
];

const STATS = [
  { value: '300+', label: 'Platforms Scanned' },
  { value: '8', label: 'OSINT Engines' },
  { value: 'AI', label: 'Powered Reports' },
  { value: '100%', label: 'Open Source' },
];

const FEATURES = [
  { icon: '🕵️', title: 'Multi-Source Intelligence', desc: 'Combine data from phone, email, username, and domain recon into a single unified dossier.' },
  { icon: '🧠', title: 'AI Relationship Graphs', desc: 'Gemini AI extracts entity relationships and renders interactive knowledge graphs from raw OSINT data.' },
  { icon: '📊', title: 'PDF Report Export', desc: 'Generate professional FBI-style or corporate intelligence reports exported as PDFs in one click.' },
  { icon: '🔐', title: 'Secure & Private', desc: 'All investigation data is encrypted in transit. Cases stored securely in your private MongoDB instance.' },
  { icon: '⚡', title: 'Real-time Scanning', desc: 'Live server-sent events stream Sherlock results in real time as they are discovered.' },
  { icon: '🌍', title: 'Global Threat Detection', desc: 'Cross-reference findings against known threat databases and reputation APIs.' },
];

const TYPEWRITER_WORDS = ['OSINT Intelligence', 'Phone Recon', 'Username Hunting', 'AI Reports', 'Threat Detection'];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [twIndex, setTwIndex] = useState(0);
  const [twText, setTwText] = useState('');
  const [twDeleting, setTwDeleting] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Typewriter effect
  useEffect(() => {
    const word = TYPEWRITER_WORDS[twIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (!twDeleting && twText.length < word.length) {
      timeout = setTimeout(() => setTwText(word.slice(0, twText.length + 1)), 80);
    } else if (!twDeleting && twText.length === word.length) {
      timeout = setTimeout(() => setTwDeleting(true), 1800);
    } else if (twDeleting && twText.length > 0) {
      timeout = setTimeout(() => setTwText(twText.slice(0, -1)), 45);
    } else {
      setTwDeleting(false);
      setTwIndex((i) => (i + 1) % TYPEWRITER_WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [twText, twDeleting, twIndex]);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${p.alpha})`;
        ctx.fill();
      });
      // draw edges
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(14,165,233,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  const faqs = [
    { q: 'Is ShadowScan free to use?', a: 'Yes, ShadowScan is open-source and free. You can self-host it with your own API keys.' },
    { q: 'Which API keys do I need?', a: 'RapidAPI key for WhatsApp intelligence, and a Google Gemini API key for AI-powered reports. Other tools (Sherlock, Nmap, etc.) run locally on your server.' },
    { q: 'Is my investigation data private?', a: 'Yes. All data is stored in your own MongoDB instance. Nothing is shared with third parties.' },
    { q: 'Can I export reports as PDFs?', a: 'Absolutely. ShadowScan generates professionally formatted PDF dossiers from any investigation case.' },
    { q: 'Does it work on mobile?', a: 'Yes. The dashboard is fully responsive and works on mobile, tablet, and desktop.' },
  ];

  return (
    <div style={{ background: '#020617', color: '#e2e8f0', fontFamily: "'Space Grotesk', 'Inter', sans-serif", overflowX: 'hidden' }}>
      {/* Particle background */}
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Cyber grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(14,165,233,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🕵️</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 3, color: '#0ea5e9' }}>SHADOW SCAN</div>
            <div style={{ fontSize: 9, color: '#475569', letterSpacing: 1.5, fontWeight: 600 }}>OSINT INTELLIGENCE</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid rgba(14,165,233,0.4)', color: '#0ea5e9', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, letterSpacing: 1, fontSize: 13 }}>
            SIGN IN
          </button>
          <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, letterSpacing: 1, fontSize: 13, boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}>
            GET STARTED
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 20px 60px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 32, fontSize: 12, color: '#38bdf8', letterSpacing: 2, fontWeight: 700 }}>
          ◆ POWERED BY FSOCIETY PK ◆
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 80px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
          <span style={{ color: '#e2e8f0' }}>Open Source</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {twText}<span style={{ animation: 'blink 1s step-end infinite', opacity: 1 }}>|</span>
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 640, lineHeight: 1.7, marginBottom: 40 }}>
          Professional-grade OSINT investigation platform. Combine AI-powered analysis, multi-source reconnaissance, and relationship mapping into stunning intelligence reports.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', border: 'none', color: '#fff', padding: '14px 36px', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 16, letterSpacing: 1, boxShadow: '0 0 40px rgba(14,165,233,0.4)', transition: 'all 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}>
            START FREE INVESTIGATION →
          </button>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid rgba(14,165,233,0.4)', color: '#0ea5e9', padding: '14px 36px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>
            SIGN IN
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', marginTop: 64 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', letterSpacing: 1.5, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: '#0ea5e9', letterSpacing: 3, fontWeight: 700, marginBottom: 12 }}>CAPABILITIES</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#e2e8f0' }}>Intelligence at Every Layer</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(14,165,233,0.12)', borderRadius: 16, padding: 28, transition: 'all 0.3s', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(14,165,233,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.12)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 10, color: '#e2e8f0' }}>{f.title}</div>
              <div style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px', background: 'rgba(14,165,233,0.03)', borderTop: '1px solid rgba(14,165,233,0.08)', borderBottom: '1px solid rgba(14,165,233,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: '#0ea5e9', letterSpacing: 3, fontWeight: 700, marginBottom: 12 }}>ARSENAL</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#e2e8f0' }}>Supported OSINT Tools</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {TOOLS.map(t => (
              <div key={t.name} style={{ background: 'rgba(2,6,23,0.9)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{t.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#c4b5fd', marginBottom: 4 }}>{t.name}</div>
                  <div style={{ color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: '#0ea5e9', letterSpacing: 3, fontWeight: 700, marginBottom: 12 }}>FAQ</div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 900, color: '#e2e8f0' }}>Common Questions</h2>
        </div>
        {faqs.map((faq, idx) => (
          <div key={idx} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(14,165,233,0.1)', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
            <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} style={{ width: '100%', background: 'none', border: 'none', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#e2e8f0', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
              {faq.q}
              <span style={{ color: '#0ea5e9', fontSize: 20, transition: 'transform 0.3s', transform: faqOpen === idx ? 'rotate(45deg)' : '' }}>+</span>
            </button>
            {faqOpen === idx && (
              <div style={{ padding: '0 24px 18px', color: '#94a3b8', fontSize: 14, lineHeight: 1.7 }}>{faq.a}</div>
            )}
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(14,165,233,0.1)', padding: '48px 40px', textAlign: 'center' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🕵️</div>
          <span style={{ fontWeight: 900, letterSpacing: 3, color: '#0ea5e9', fontSize: 15 }}>SHADOW SCAN</span>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'GitHub', href: 'https://github.com/fsociety-pk', icon: '🐙' },
            { label: 'LinkedIn', href: 'https://linkedin.com/company/fsociety-pk', icon: '💼' },
            { label: 'Discord', href: 'https://discord.gg/fsociety-pk', icon: '🎮' },
          ].map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.18)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.08)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
              <span>{link.icon}</span>{link.label}
            </a>
          ))}
        </div>

        <div style={{ color: '#334155', fontSize: 12, letterSpacing: 1.5, fontWeight: 600 }}>
          © {new Date().getFullYear()} FSOCIETY PK — DEVELOPED BY FSOCIETY PK • ALL RIGHTS RESERVED
        </div>
        <div style={{ color: '#1e3a5f', fontSize: 11, marginTop: 6, letterSpacing: 1 }}>
          FOR AUTHORIZED OSINT INVESTIGATIONS ONLY
        </div>

        <style>{`
          @keyframes blink { 50% { opacity: 0; } }
        `}</style>
      </footer>
    </div>
  );
};

export default LandingPage;
