/**
 * OsintChatbot — Floating AI assistant widget.
 * Communicates with the backend `/chat` endpoint using the configured axios instance.
 * Supports text messages and image uploads for multimodal OSINT queries.
 *
 * Workflow keywords ("help", "what do I do", "how to use", "guide me", "next step")
 * are intercepted client-side and return an instant 3-step workflow guide
 * without hitting the backend — keeping responses snappy.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Badge } from 'antd';
import {
  MessageOutlined, CloseOutlined, SendOutlined,
  RobotOutlined, UserOutlined, PictureOutlined, RadarChartOutlined,
  ExpandOutlined, CompressOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
}

/** Keywords that trigger an instant local workflow guide response. */
const WORKFLOW_TRIGGERS = [
  'help', 'guide me', 'workflow', 'how to use', 'tutorial', 'steps',
];

/** The 3-step workflow explanation returned for help keywords. */
const WORKFLOW_REPLY = `Here's the **3-Step OSINT Workflow** for Shadow Scan:

**Step 1 — Run OSINT Tools**
Navigate to the [OSINT Tools](/tools) section and choose your reconnaissance engine:
- **Sherlock** → username presence across 300+ platforms
- **Holehe** → email account discovery & intelligence
- **WhatsOSINT** → phone number & WhatsApp intelligence
- **Whois / DNS** → domain ownership & infrastructure records
- **Metadata Extractor** → hidden metadata in images, PDFs & documents

**Step 2 — Paste Raw Findings**
Copy all raw output from the tools and paste it into the **Report Generator** textarea. You can also attach supporting files (screenshots, docs, exports).

**Step 3 — Generate AI Report**
Click **"Generate Intelligence Report"**. The AI engine will analyse your findings, extract entities, build relationship mappings, and produce a structured forensic report.

> Pro Tip: Use the [Intelligence Analyst](/tools) tool to auto-extract entities from any unstructured text before generating a report.

Ask me anything about a specific tool or step!`;

const OsintChatbot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello, Operative! I'm your **OSINT AI Assistant**.

I can help you with:
- **Guidance** on the 3-step investigation workflow
- **Tool questions** (Sherlock, Holehe, Whois, Metadata Extractor)
- **Analysis** of intelligence findings
- **Image analysis** (attach a screenshot for multimodal AI)
- **General investigation Q&A** (strategy, interpretation, next steps)

Type **"help"** or **"guide me"** to see the full workflow, or ask me anything!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Intercepts clicks on internal navigation links rendered inside AI messages.
   * Links with `data-internal="true"` are routed via React Router instead of
   * triggering a full page reload.
   */
  const handleChatContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    let current: HTMLElement | null = target;
    for (let i = 0; i < 3; i++) {
      if (!current) break;
      if (current.tagName === 'A') {
        if (current.getAttribute('data-internal') === 'true') {
          e.preventDefault();
          const path = current.getAttribute('href');
          if (path) navigate(path);
        }
        break;
      }
      current = current.parentElement;
    }
  };

  /**
   * Converts a markdown-like assistant response to safe HTML.
   * Handles: bold, inline code, markdown links (internal vs external), and bullet lists.
   */
  const renderFormattedContent = (content: string) => {
    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #4f46e5; font-weight: 700;">$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code style="background: #0f172a; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11.5px; border: 1px solid #1e293b; word-break: break-all;">$1</code>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const isInternal = url.startsWith('/') || url.includes('localhost') || url.includes('shadow-scan');
      if (isInternal) {
        return `<a href="${url}" data-internal="true" style="color: #10b981; font-weight: 800; text-decoration: none; background: rgba(16, 185, 129, 0.08); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.25); display: inline-flex; align-items: center; gap: 4px; transition: all 0.3s; margin: 4px 2px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.06); cursor: pointer;">${label} ↗</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #7c3aed; font-weight: 700; text-decoration: underline; cursor: pointer;">${label} ↗</a>`;
    });
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote style="border-left: 3px solid #0ea5e9; padding: 6px 12px; margin: 8px 0; background: rgba(14,165,233,0.05); border-radius: 0 8px 8px 0; color: #475569; font-style: italic;">$1</blockquote>');
    html = html.replace(/^\s*-\s+(.+)$/gm, '<li style="margin-left: 14px; margin-bottom: 4px; list-style-type: square; color: #475569;">$1</li>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  /* Auto-focus the input whenever the panel opens */
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  /**
   * Checks if the user's message matches a workflow help keyword.
   * Returns true if an instant local reply was injected (skip API call).
   */
  const handleWorkflowKeyword = (msg: string, currentMsgs: ChatMessage[]): boolean => {
    const lower = msg.toLowerCase().trim();
    const matched = WORKFLOW_TRIGGERS.some(kw => lower.includes(kw));
    if (!matched) return false;

    setMessages([
      ...currentMsgs,
      { role: 'user', content: msg },
      { role: 'assistant', content: WORKFLOW_REPLY },
    ]);
    return true;
  };

  /** Sends the current message (and optional image) to the backend chat endpoint. */
  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMsg = input.trim();
    const currentImg = selectedImage;
    const historyBeforeSend = [...messages];

    setInput('');
    setSelectedImage(null);
    setLoading(true);

    // Check workflow keywords before hitting the API
    if (!currentImg && handleWorkflowKeyword(userMsg, historyBeforeSend)) {
      setLoading(false);
      return;
    }

    const newMessages: ChatMessage[] = [
      ...historyBeforeSend,
      { role: 'user', content: userMsg, image_url: currentImg || undefined },
    ];
    setMessages(newMessages);

    try {
      const response = await api.post('/chat', {
        message: userMsg,
        image_url: currentImg,
        history: historyBeforeSend.map(m => ({ role: m.role, content: m.content })),
      });

      if (response.data.success) {
        setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'I encountered an error analyzing that request.' }]);
      }
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Connection to the AI engine failed. Please try again later.';
      setMessages([...newMessages, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  /** Reads the selected image file as a base64 data URL for preview and upload. */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  /* Dynamic chat panel dimensions */
  const panelWidth = isExpanded ? 580 : 460;
  const panelHeight = isExpanded ? 680 : 560;

  return (
    <>
      {/* Floating Action Button */}
      <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
        {!isOpen && (
          <Badge dot status="processing" color="cyan" offset={[-6, 6]}>
            <button
              onClick={() => setIsOpen(true)}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                border: '2px solid rgba(255,255,255,0.5)',
                boxShadow: '0 8px 30px rgba(14, 165, 233, 0.5)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease',
                color: 'white', fontSize: 26,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px) scale(1.08)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(14, 165, 233, 0.7)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = '';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px rgba(14, 165, 233, 0.5)';
              }}
            >
              <MessageOutlined />
            </button>
          </Badge>
        )}

        {isOpen && (
          <div style={{
            width: panelWidth,
            height: panelHeight,
            display: 'flex', flexDirection: 'column',
            background: '#ffffff',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(14, 165, 233, 0.2), 0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            animation: 'floatIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            transition: 'width 0.3s ease, height 0.3s ease',
            // Keep panel on screen on small viewports
            maxWidth: 'calc(100vw - 60px)',
            maxHeight: 'calc(100vh - 100px)',
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  <RadarChartOutlined style={{ color: 'white', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>OSINT AI Assistant</div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, letterSpacing: 1 }}>
                    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#4ade80', marginRight: 5, animation: 'pulse 2s infinite' }} />
                    ONLINE • Type "help" for workflow guide
                  </div>
                </div>
              </div>

              {/* Header controls: expand/collapse + close */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={() => setIsExpanded(v => !v)}
                  title={isExpanded ? 'Compress' : 'Expand'}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 8, color: 'white', cursor: 'pointer',
                    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'}
                >
                  {isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 8, color: 'white', cursor: 'pointer',
                    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'}
                >
                  <CloseOutlined />
                </button>
              </div>
            </div>

            {/* Message List */}
            <div
              onClick={handleChatContainerClick}
              style={{
                flex: 1, overflowY: 'auto', padding: '16px',
                background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: 8, alignItems: 'flex-end',
                }}>
                  <Avatar
                    icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    size={30}
                    style={{
                      flexShrink: 0,
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'
                        : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    }}
                  />
                  <div style={{
                    maxWidth: '82%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)'
                      : '#ffffff',
                    color: msg.role === 'user' ? 'white' : '#1e293b',
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    boxShadow: msg.role === 'user'
                      ? '0 4px 12px rgba(14, 165, 233, 0.3)'
                      : '0 2px 8px rgba(0,0,0,0.07)',
                    border: msg.role === 'assistant' ? '1px solid rgba(14, 165, 233, 0.12)' : 'none',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    minWidth: 0,
                  }}>
                    {msg.image_url && (
                      <img src={msg.image_url} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
                    )}
                    {msg.role === 'user' ? msg.content : renderFormattedContent(msg.content)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <Avatar icon={<RobotOutlined />} size={30}
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', flexShrink: 0 }} />
                  <div style={{
                    background: '#ffffff', padding: '10px 16px',
                    borderRadius: '4px 18px 18px 18px',
                    border: '1px solid rgba(14, 165, 233, 0.15)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                          background: '#0ea5e9', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: '12px 14px',
              background: '#ffffff',
              borderTop: '1px solid rgba(14, 165, 233, 0.12)',
              flexShrink: 0,
            }}>
              {selectedImage && (
                <div style={{ marginBottom: 8, position: 'relative', display: 'inline-block' }}>
                  <img src={selectedImage} alt="Preview" style={{ height: 50, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <button
                    onClick={() => setSelectedImage(null)}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      background: '#ef4444', border: 'none', borderRadius: '50%',
                      color: 'white', width: 18, height: 18, cursor: 'pointer',
                      fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >✕</button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Hidden file input for image attachment */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  title="Attach image"
                  style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(14, 165, 233, 0.08)',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    color: '#0ea5e9', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, transition: 'all 0.2s',
                  }}
                >
                  <PictureOutlined />
                </button>

                {/* Text input wrapper */}
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 20, padding: '0 14px 0 16px',
                  transition: 'all 0.3s ease',
                  gap: 8,
                }}
                  onFocus={() => {}}
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder='Ask anything, or type "help"...'
                    disabled={loading}
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      background: 'transparent',
                      color: '#1e293b', fontSize: 13.5,
                      fontFamily: 'Space Grotesk, sans-serif',
                      padding: '9px 0',
                      minWidth: 0,
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || (!input.trim() && !selectedImage)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: (loading || (!input.trim() && !selectedImage))
                        ? '#e2e8f0'
                        : 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 14,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <SendOutlined />
                  </button>
                </div>
              </div>

              <div style={{
                textAlign: 'center', marginTop: 8,
                fontSize: 10, color: '#94a3b8', letterSpacing: 0.5,
              }}>
                Powered by Shadow Scan AI • OSINT Intelligence
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OsintChatbot;
