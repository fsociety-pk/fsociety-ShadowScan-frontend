import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, GithubOutlined, LinkedinOutlined, WechatOutlined } from '@ant-design/icons';

// Inline SVG icons for each tool
const SherlockIcon = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#a78bfa" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
// ... (other icons unchanged)

// ... rest of file unchanged until the nav section






const PhoneInfogaIcon = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#38bdf8" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    <path d="M14.5 6.5s1 0 2 1 1 2 1 2" /><path d="M14.5 2s3 0 5 2 2 5 2 5" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" width="30" height="30" fill="#25D366">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.737 5.49 2.027 7.8L0 32l8.418-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.29 13.29 0 01-6.77-1.85l-.487-.29-5.003 1.193 1.227-4.867-.32-.5A13.267 13.267 0 012.667 16C2.667 8.82 8.82 2.667 16 2.667c7.18 0 13.333 6.153 13.333 13.333 0 7.18-6.153 13.333-13.333 13.333zm7.307-9.973c-.4-.2-2.367-1.167-2.733-1.3-.367-.133-.633-.2-.9.2-.267.4-1.033 1.3-1.267 1.567-.233.267-.467.3-.867.1-.4-.2-1.687-.62-3.213-1.98-1.187-1.06-1.987-2.367-2.22-2.767-.233-.4-.025-.617.175-.817.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667.133-.267.067-.5-.033-.7-.1-.2-.9-2.167-1.233-2.967-.333-.8-.667-.7-.9-.713h-.767c-.267 0-.7.1-1.067.5s-1.4 1.367-1.4 3.333 1.433 3.867 1.633 4.133c.2.267 2.82 4.307 6.833 6.033.953.413 1.7.66 2.28.847.958.307 1.83.263 2.52.16.768-.113 2.367-.967 2.7-1.9.333-.933.333-1.733.233-1.9-.1-.167-.367-.267-.767-.467z" />
  </svg>
);

const HoleheIcon = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#f97316" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const WhoisIcon = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#34d399" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const GeminiIcon = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
    <defs><linearGradient id="gm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4285F4" /><stop offset="100%" stopColor="#34A853" /></linearGradient></defs>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="url(#gm)" />
    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="url(#gm)" />
  </svg>
);

const TOOLS = [
  { name: 'Sherlock', Icon: SherlockIcon, desc: 'Username hunting across 300+ social platforms' },
  { name: 'PhoneInfoga', Icon: PhoneInfogaIcon, desc: 'Deep carrier & telecom intelligence recon' },
  { name: 'WhatsApp Intel', Icon: WhatsAppIcon, desc: 'Profile photo & business account classification' },
  { name: 'Holehe', Icon: HoleheIcon, desc: 'Email footprint & account registration detection' },
  { name: 'Whois', Icon: WhoisIcon, desc: 'Domain ownership & registrar intelligence' },
  { name: 'Gemini AI Reports', Icon: GeminiIcon, desc: 'AI relationship graphs & structured dossiers' },
];

const STATS = [
  { value: '300+', label: 'Platforms Scanned' },
  { value: '6', label: 'OSINT Engines' },
  { value: 'AI', label: 'Powered Reports' },
  { value: '100%', label: 'Sovereign & Secure' },
];

const FEATURES = [
  { title: 'Multi-Source Intelligence', desc: 'Combine data from phone, email, username, and domain recon into a single unified dossier.' },
  { title: 'AI Relationship Graphs', desc: 'Gemini AI extracts entity relationships and renders interactive knowledge graphs from raw OSINT data.' },
  { title: 'PDF Report Export', desc: 'Generate professional FBI-style or corporate intelligence reports exported as PDFs in one click.' },
  { title: 'Secure & Private', desc: 'All investigation data is encrypted in transit. Cases stored securely in your private MongoDB instance.' },
  { title: 'Real-time Scanning', desc: 'Live server-sent events stream Sherlock results in real time as they are discovered.' },
  { title: 'Global Threat Detection', desc: 'Cross-reference findings against known threat databases and reputation APIs.' },
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
    { q: 'Is ShadowScan free to use?', a: 'Yes, ShadowScan is sovereign and free to host. You can deploy it privately with your own API keys.' },
    { q: 'Which API keys do I need?', a: 'RapidAPI key for WhatsApp intelligence, and a Google Gemini API key for AI-powered reports. Other tools (Sherlock, Nmap, etc.) run locally on your server.' },
    { q: 'Is my investigation data private?', a: 'Yes. All data is stored in your own MongoDB instance. Nothing is shared with third parties.' },
    { q: 'Can I export reports as PDFs?', a: 'Absolutely. ShadowScan generates professionally formatted PDF dossiers from any investigation case.' },
    { q: 'Does it work on mobile?', a: 'Yes. The dashboard is fully responsive and works on mobile, tablet, and desktop.' },
  ];

  return (
    <div style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f5f8fc 55%, #eef4fb 100%)', color: '#0f172a', fontFamily: "'Space Grotesk', 'Inter', sans-serif", overflowX: 'hidden' }}>
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
        background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(15,23,42,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            <UserOutlined style={{ fontSize: 18, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 3, color: '#0284c7' }}>SHADOW SCAN</div>
            <div style={{ fontSize: 9, color: '#64748b', letterSpacing: 1.5, fontWeight: 600 }}>OSINT INTELLIGENCE</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid rgba(2,132,199,0.35)', color: '#0284c7', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, letterSpacing: 1, fontSize: 13 }}>
            SIGN IN
          </button>
          <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, letterSpacing: 1, fontSize: 13, boxShadow: '0 0 20px rgba(14,165,233,0.18)' }}>
            GET STARTED
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 20px 60px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 32, fontSize: 12, color: '#0284c7', letterSpacing: 2, fontWeight: 700 }}>
          ◆ POWERED BY FSOCIETY PK ◆
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 80px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
          <span style={{ color: '#0f172a', textShadow: '2px 4px 10px rgba(15,23,42,0.15)' }}>Sovereign OSINT Portal</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0px 0px 4px rgba(139,92,246,0.1)' }}>
            {twText}<span style={{ animation: 'blink 1s step-end infinite', opacity: 1 }}>|</span>
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#475569', maxWidth: 640, lineHeight: 1.7, marginBottom: 40 }}>
          Professional-grade OSINT investigation platform. Combine AI-powered analysis, multi-source reconnaissance, and relationship mapping into stunning intelligence reports.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', border: 'none', color: '#fff', padding: '14px 36px', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 16, letterSpacing: 1, boxShadow: '0 0 28px rgba(14,165,233,0.22)', transition: 'all 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}>
            START FREE INVESTIGATION →
          </button>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid rgba(2,132,199,0.35)', color: '#0284c7', padding: '14px 36px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>
            SIGN IN
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', marginTop: 64 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg,#0284c7,#2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', letterSpacing: 1.5, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: '#0284c7', letterSpacing: 3, fontWeight: 700, marginBottom: 12 }}>CAPABILITIES</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#0f172a' }}>Intelligence at Every Layer</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.12)', borderRadius: 16, padding: 28, transition: 'all 0.3s', cursor: 'default', boxShadow: '0 16px 30px rgba(15,23,42,0.04)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(14,165,233,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.12)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 30px rgba(15,23,42,0.04)'; }}>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 10, color: '#0f172a' }}>{f.title}</div>
              <div style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px', background: 'rgba(14,165,233,0.03)', borderTop: '1px solid rgba(14,165,233,0.08)', borderBottom: '1px solid rgba(14,165,233,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: '#0ea5e9', letterSpacing: 3, fontWeight: 700, marginBottom: 12 }}>ARSENAL</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#0f172a' }}>Supported OSINT Tools</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {TOOLS.map(t => (
              <div key={t.name} style={{ background: '#ffffff', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 16px 30px rgba(15,23,42,0.04)' }}>
                <div style={{ flexShrink: 0, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(14,165,233,0.08)', borderRadius: 10, border: '1px solid rgba(14,165,233,0.1)' }}>
                  <t.Icon />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>{t.name}</div>
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
          <div style={{ fontSize: 12, color: '#0284c7', letterSpacing: 3, fontWeight: 700, marginBottom: 12 }}>FAQ</div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 900, color: '#0f172a' }}>Common Questions</h2>
        </div>
        {faqs.map((faq, idx) => (
          <div key={idx} style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.1)', borderRadius: 12, marginBottom: 12, overflow: 'hidden', boxShadow: '0 10px 24px rgba(15,23,42,0.04)' }}>
            <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} style={{ width: '100%', background: 'none', border: 'none', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#0f172a', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
              {faq.q}
              <span style={{ color: '#0284c7', fontSize: 20, transition: 'transform 0.3s', transform: faqOpen === idx ? 'rotate(45deg)' : '' }}>+</span>
            </button>
            {faqOpen === idx && (
              <div style={{ padding: '0 24px 18px', color: '#475569', fontSize: 14, lineHeight: 1.7 }}>{faq.a}</div>
            )}
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(14,165,233,0.1)', padding: '48px 40px', textAlign: 'center', background: 'rgba(255,255,255,0.78)' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            <UserOutlined style={{ fontSize: 16, color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 900, letterSpacing: 3, color: '#0284c7', fontSize: 15 }}>SHADOW SCAN</span>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'GitHub', href: 'https://github.com/orgs/fsociety-pk', icon: <GithubOutlined /> },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/company/113114181', icon: <LinkedinOutlined /> },
            { label: 'Discord', href: 'https://discord.gg/fsociety-pk', icon: <WechatOutlined /> },
          ].map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#0284c7', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.08)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
              <span style={{ fontSize: 16 }}>{link.icon}</span>{link.label}
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
