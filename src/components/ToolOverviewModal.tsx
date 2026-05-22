import React from 'react';
import { Modal, Card, Typography, Row, Col, Tag, Space, Divider } from 'antd';
import { 
  UserOutlined, MailOutlined, GlobalOutlined, 
  InfoCircleOutlined, WhatsAppOutlined, RobotOutlined, RadarChartOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface ToolOverviewModalProps {
  open: boolean;
  onClose: () => void;
}

const ToolCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  useCase: string; 
  color: string;
  tags: string[];
}> = ({ title, description, icon, useCase, color, tags }) => (
  <Card 
    hoverable 
    style={{ 
      height: '100%', 
      borderRadius: 16, 
      border: `1.5px solid #e2e8f0`,
      background: '#ffffff',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    }}
    styles={{ body: { padding: 20 } }}
  >
    <div style={{ 
      position: 'absolute', 
      top: -20, 
      right: -20, 
      fontSize: 80, 
      color: `${color}10`, 
      transform: 'rotate(-15deg)',
      zIndex: 0
    }}>
      {icon}
    </div>
    
    <Space orientation="vertical" size="middle" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ 
          width: 44, 
          height: 44, 
          borderRadius: 10, 
          background: `${color}15`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 22,
          color: color
        }}>
          {icon}
        </div>
        <Title level={4} style={{ margin: 0, color: '#1e293b', fontSize: 16, fontWeight: 800 }}>{title}</Title>
      </div>

      <Paragraph style={{ color: '#64748b', fontSize: 13, margin: 0, minHeight: 60, lineHeight: 1.5 }}>
        {description}
      </Paragraph>

      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <Text strong style={{ fontSize: 10, color: color, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
          <InfoCircleOutlined /> Typical Use Case
        </Text>
        <Text style={{ fontSize: 12, color: '#1e293b', fontWeight: 500 }}>{useCase}</Text>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.map(tag => <Tag key={tag} style={{ borderRadius: 6, fontSize: 10, margin: 0, fontWeight: 600, padding: '2px 8px' }}>{tag}</Tag>)}
      </div>
    </Space>
  </Card>
);

const ToolOverviewModal: React.FC<ToolOverviewModalProps> = ({ open, onClose }) => {
  const tools = [
    {
      title: "Sherlock Username Lookup",
      description: "Our advanced username reconnaissance engine. It scans over 350 social media platforms simultaneously to find every account associated with a specific handle.",
      icon: <UserOutlined />,
      color: "#4f46e5",
      useCase: "Tracing a suspect's digital footprint across Instagram, Twitter, GitHub, and niche forums.",
      tags: ["Username Lookup", "Social Footprint", "Identity Mapping"]
    },
    {
      title: "Holehe Email Intelligence",
      description: "A comprehensive email intelligence framework. It doesn't just verify emails; it uncovers professional profiles and registered social accounts while filtering out adult platforms.",
      icon: <MailOutlined />,
      color: "#ef4444",
      useCase: "Determining if an email is registered on major public platforms and finding connected social networks.",
      tags: ["Email Intelligence", "Holehe", "Profile Mapping"]
    },
    {
      title: "PhoneOSINT Phone Recon",
      description: "Real-time phone intelligence gathering. Retrieves profile photos, status text, carrier data, and public footprint across directories and social platforms.",
      icon: <WhatsAppOutlined />,
      color: "#25D366",
      useCase: "Verifying the identity of an unknown caller or checking a target's public profile and digital footprint.",
      tags: ["Phone Recon", "Live Status", "Phone Verification"]
    },
    {
      title: "Whois DNS Intelligence",
      description: "Infrastructure ownership tracking. It reveals the registration details, physical address, and contact info of website owners and IP address blocks.",
      icon: <GlobalOutlined />,
      color: "#3b82f6",
      useCase: "Identifying the real person or company behind a suspicious website or phishing domain.",
      tags: ["Domain Ownership", "Infrastructure", "Legal Intel"]
    }
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
          <RadarChartOutlined style={{ color: '#4f46e5', fontSize: 22 }} />
          <span style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', letterSpacing: 0.5 }}>SHADOW SCAN FORENSIC ARMORY SPECS</span>
        </div>
      }
      styles={{ body: { padding: '24px 0 10px', maxHeight: '80vh', overflowY: 'auto' } }}
      style={{ borderRadius: 20, overflow: 'hidden' }}
    >
      <div style={{ padding: '0 20px' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 32, 
          padding: '24px', 
          background: 'rgba(79, 70, 229, 0.03)', 
          borderRadius: 16,
          border: '1.5px dashed rgba(79, 70, 229, 0.15)'
        }}>
          <Tag color="geekblue" style={{ marginBottom: 12, borderRadius: 20, padding: '2px 14px', fontWeight: 700 }}>ARMORY RECON SYSTEM</Tag>
          <Title level={3} style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
            ShadowScan Intelligence Toolkit
          </Title>
          <Paragraph style={{ maxWidth: 750, margin: '0 auto', fontSize: 14, color: '#64748b', fontWeight: 500, lineHeight: 1.6 }}>
            We have integrated professional-grade forensic engines into a unified cyber matrix. 
            Use these utilities to perform identity checks, verify communication nodes, and compile forensic profiles.
          </Paragraph>
        </div>

        <Row gutter={[20, 20]}>
          {tools.map((tool, index) => (
            <Col xs={24} md={12} lg={8} key={index}>
              <ToolCard {...tool} />
            </Col>
          ))}
        </Row>

        <Divider style={{ margin: '30px 0 20px' }} />

        <Card style={{ borderRadius: 16, border: '1px dashed #25D366', background: 'rgba(37, 211, 102, 0.02)', marginBottom: 10 }}>
          <Row align="middle" gutter={20}>
            <Col xs={24} md={3} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44, color: '#25D366' }}>
                <RobotOutlined />
              </div>
            </Col>
            <Col xs={24} md={21}>
              <Title level={4} style={{ color: '#25D366', margin: '0 0 4px', fontWeight: 800, fontSize: 15 }}>AI-Assisted Operational Intelligence</Title>
              <Paragraph style={{ margin: 0, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                Not sure which tool to select? Engage the <strong>Intelligence Analyst Chatbot</strong> at the bottom right. 
                Our customized LLM identifies the target parameters and provides direct Glowing Forensic Badge shortcuts to instantly select and focus the correct scanner card!
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default ToolOverviewModal;
