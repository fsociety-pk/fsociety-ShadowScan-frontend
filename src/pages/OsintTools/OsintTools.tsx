import React from 'react';
import { Tabs, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, FileSearchOutlined, SearchOutlined, GlobalOutlined, RadarChartOutlined, RobotOutlined, FileTextOutlined, ToolOutlined, InteractionOutlined, ThunderboltOutlined } from '@ant-design/icons';

import IntelligenceAnalyst from './IntelligenceAnalyst';
import UsernameSearch from './UsernameSearch';
import EmailLookup from './EmailLookup';
import PhoneLookup from './PhoneLookup';
import MetadataExtractor from './MetadataExtractor';
import ReverseImageSearch from './ReverseImageSearch';
import NetworkRecon from './NetworkRecon';
import SocialMediaProfileFinder from './SocialMediaProfileFinder';
import IntelligenceReportGenerator from './IntelligenceReportGenerator';
import KaliSherlockSearch from './KaliSherlockSearch';
import KaliWhoisLookup from './KaliWhoisLookup';
import KaliTheHarvester from './KaliTheHarvester';
import KaliNmapScan from './KaliNmapScan';


const { Title, Paragraph } = Typography;

const OsintTools: React.FC = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2} style={{ 
        background: 'var(--cyber-gradient)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        fontSize: '2.5rem',
        marginBottom: 8
      }}>
        OSINT Investigation Command
      </Title>
      <Paragraph style={{ color: 'var(--cyber-blue)', marginBottom: 30, fontSize: '1.1rem', fontWeight: 500 }}>
        Access the world's most powerful intelligence gathering tools. Integrated with AI for advanced pattern recognition.
      </Paragraph>

      <Tabs
        defaultActiveKey="auto"
        type="card"
        items={[
          {
            key: 'auto',
            label: <span><ThunderboltOutlined style={{ color: 'var(--primary)' }} /> Auto Scan (AI)</span>,
            children: <IntelligenceReportGenerator />,
          },
          {
            key: 'manual',
            label: <span><ToolOutlined /> Manual Scan Tools</span>,
            children: (
              <Tabs
                defaultActiveKey="analyst"
                tabPosition="left"
                style={{ minHeight: '60vh' }}
                items={[
                  {
                    key: 'username',
                    label: <span><UserOutlined /> Username Lookup</span>,
                    children: <KaliSherlockSearch />,
                  },
                  {
                    key: 'email',
                    label: <span><MailOutlined /> Email Lookup</span>,
                    children: <KaliTheHarvester />,
                  },
                  {
                    key: 'dns',
                    label: <span><GlobalOutlined /> DNS Lookup</span>,
                    children: <KaliWhoisLookup />,
                  },
                  {
                    key: 'image',
                    label: <span><SearchOutlined /> Image OSINT</span>,
                    children: <ReverseImageSearch />,
                  },
                  {
                    key: 'metadata',
                    label: <span><FileSearchOutlined /> Metadata</span>,
                    children: <MetadataExtractor />,
                  },
                ]}
              />
            ),
          }
        ]}
      />
    </div>
  );
};

export default OsintTools;
