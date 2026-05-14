import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Avatar, Badge, Typography } from 'antd';
import {
  MessageOutlined, CloseOutlined, SendOutlined,
  RobotOutlined, UserOutlined, PictureOutlined, RadarChartOutlined
} from '@ant-design/icons';
import api from '../api/axiosConfig';

const { Text } = Typography;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
}

const OsintChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello, Operative! I am your OSINT AI Assistant. Ask me about intelligence analysis, tool usage, or findings.' }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;
    const userMsg = input.trim();
    const currentImg = selectedImage;
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg, image_url: currentImg || undefined }];
    setMessages(newMessages);
    setInput('');
    setSelectedImage(null);
    setLoading(true);
    try {
      const response = await api.post('/chat', {
        message: userMsg,
        image_url: currentImg,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      if (response.data.success) {
        setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'I encountered an error analyzing that request.' }]);
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Connection to the AI engine failed. Please try again later.';
      setMessages([...newMessages, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* FAB Button */}
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
            width: 360, height: 520,
            display: 'flex', flexDirection: 'column',
            background: '#ffffff',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(14, 165, 233, 0.2), 0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            animation: 'floatIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {/* Header */}
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
                    ONLINE
                  </div>
                </div>
              </div>
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

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px',
              background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
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
                    maxWidth: '78%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)'
                      : '#ffffff',
                    color: msg.role === 'user' ? 'white' : '#1e293b',
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    boxShadow: msg.role === 'user'
                      ? '0 4px 12px rgba(14, 165, 233, 0.3)'
                      : '0 2px 8px rgba(0,0,0,0.07)',
                    border: msg.role === 'assistant' ? '1px solid rgba(14, 165, 233, 0.12)' : 'none',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.image_url && (
                      <img src={msg.image_url} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}

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
                <input
                  type="file" accept="image/*"
                  ref={fileInputRef} style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
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
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Ask about intelligence findings..."
                    disabled={loading}
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      background: 'transparent',
                      color: '#1e293b', fontSize: 13.5,
                      fontFamily: 'Space Grotesk, sans-serif',
                      padding: '9px 0',
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
