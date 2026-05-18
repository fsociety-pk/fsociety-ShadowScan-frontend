import React from 'react';
import { Card, Typography, Row, Col, Tag, Space, Divider } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  FileSearchOutlined, 
  GlobalOutlined, 
  InfoCircleOutlined,
  WhatsAppOutlined,
  RobotOutlined,
  RadarChartOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

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
    className="hover-elevate"
    style={{ 
      height: '100%', 
      borderRadius: 16, 
      border: `1px solid var(--border-color)`,
      background: '#ffffff',
      overflow: 'hidden',
      position: 'relative'
    }}
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
          width: 48, 
          height: 48, 
          borderRadius: 12, 
          background: `${color}15`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 24,
          color: color
        }}>
          {icon}
        </div>
        <Title level={4} style={{ margin: 0, color: 'var(--text-main)', fontSize: 18 }}>{title}</Title>
      </div>

      <Paragraph style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0, minHeight: 60 }}>
        {description}
      </Paragraph>

      <div style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <Text strong style={{ fontSize: 11, color: color, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
          <InfoCircleOutlined /> Typical Use Case
        </Text>
        <Text style={{ fontSize: 13, color: 'var(--text-main)' }}>{useCase}</Text>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.map(tag => <Tag key={tag} style={{ borderRadius: 4, fontSize: 10, margin: 0 }}>{tag}</Tag>)}
      </div>
    </Space>
  </Card>
);

const ToolOverview: React.FC = () => {
  const tools = [
    {
      title: "Sherlock",
      description: "Our advanced username reconnaissance engine. It scans over 350 social media platforms simultaneously to find every account associated with a specific handle.",
      icon: <UserOutlined />,
      color: "var(--cyber-blue)",
      useCase: "Tracing a suspect's digital footprint across Instagram, Twitter, GitHub, and niche forums.",
      tags: ["Username Lookup", "Social Footprint", "Identity Mapping"]
    },
    {
      title: "Mosint",
      description: "A comprehensive email intelligence framework. It doesn't just verify emails; it uncovers data breaches, professional profiles, and connected social accounts.",
      icon: <MailOutlined />,
      color: "#ff4d4f",
      useCase: "Determining if an email has been compromised in a breach and finding who it belongs to.",
      tags: ["Email Intelligence", "Breach Discovery", "Profile Mapping"]
    },
    {
      title: "WhatsOSINT",
      description: "Real-time WhatsApp intelligence gathering. It retrieves profile photos, status updates, and account metadata directly from WhatsApp's infrastructure.",
      icon: <WhatsAppOutlined />,
      color: "#25D366",
      useCase: "Verifying the identity of an unknown caller or checking a target's current active status and bio.",
      tags: ["WhatsApp Recon", "Live Status", "Phone Verification"]
    },
    {
      title: "Metadata Extractor",
      description: "The 'digital microscope' for files. It pulls hidden forensic data from photos, documents, and videos—including GPS coordinates and camera models.",
      icon: <FileSearchOutlined />,
      color: "var(--cyber-purple)",
      useCase: "Pinpointing exactly where and when a photo was taken by extracting GPS coordinates.",
      tags: ["Forensics", "GPS Extraction", "Hidden Data"]
    },
    {
      title: "Whois Intelligence",
      description: "Infrastructure ownership tracking. It reveals the registration details, physical address, and contact info of website owners and IP address blocks.",
      icon: <GlobalOutlined />,
      color: "#1890ff",
      useCase: "Identifying the real person or company behind a suspicious website or phishing domain.",
      tags: ["Domain Ownership", "Infrastructure", "Legal Intel"]
    },
    {
      title: "Nmap Scanner",
      description: "Our security perimeter auditor. It probes systems to see which 'digital doors' (ports) are open and what services are running on a server.",
      icon: <RadarChartOutlined />,
      color: "#52c41a",
      useCase: "Checking a corporate server for vulnerable services or unauthorized open connections.",
      tags: ["Network Audit", "Port Scanning", "Service Mapping"]
    }
  ];

  return (
    <div style={{ padding: '0 20px 40px' }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 50, 
        padding: '40px 0', 
        background: 'rgba(14, 165, 233, 0.03)', 
        borderRadius: 24,
        border: '1px solid rgba(14, 165, 233, 0.1)'
      }}>
        <Tag color="blue" style={{ marginBottom: 16, borderRadius: 20, padding: '2px 16px', fontWeight: 700 }}>ARMORY OVERVIEW</Tag>
        <Title level={2} style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
          ShadowScan Intelligence Toolkit
        </Title>
        <Paragraph style={{ maxWidth: 700, margin: '0 auto', fontSize: 16, color: 'var(--text-muted)' }}>
          We have integrated professional-grade forensic engines into a simplified interface. 
          Use these tools to gather intelligence, verify identities, and analyze digital footprints.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {tools.map((tool, index) => (
          <Col xs={24} md={12} lg={8} key={index}>
            <ToolCard {...tool} />
          </Col>
        ))}
      </Row>

      <Divider style={{ margin: '60px 0' }} />

      <Card style={{ borderRadius: 20, border: '1px dashed var(--cyber-blue)', background: 'rgba(14, 165, 233, 0.02)' }}>
        <Row align="middle" gutter={40}>
          <Col xs={24} md={4} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, color: 'var(--cyber-blue)' }}>
              <RobotOutlined />
            </div>
          </Col>
          <Col xs={24} md={20}>
            <Title level={4} style={{ color: 'var(--cyber-blue)' }}>AI-Assisted Investigation</Title>
            <Paragraph style={{ margin: 0, fontSize: 15 }}>
              Not sure where to start? Use the <strong>Auto Scan (AI)</strong> tab or the <strong>Intelligence Analyst</strong>. 
              Our AI models will automatically decide which tools are best suited for your target and generate a comprehensive forensic report for you.
            </Paragraph>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ToolOverview;
