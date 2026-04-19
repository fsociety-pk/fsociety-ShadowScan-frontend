import React from 'react';
import { Tabs, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, FileSearchOutlined } from '@ant-design/icons';

import UsernameSearch from './UsernameSearch';
import EmailLookup from './EmailLookup';
import PhoneLookup from './PhoneLookup';
import MetadataExtractor from './MetadataExtractor';


const { Title, Paragraph } = Typography;

const OsintTools: React.FC = () => {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2} style={{ color: 'var(--neon-green)', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
        [ Investigation Toolbox ]
      </Title>
      <Paragraph style={{ color: '#8b949e', marginBottom: 30 }}>
        A collection of advanced gathering utilities for intelligence analysts. Access various networks to extract information on persons, digital footprints, and physical assets.
      </Paragraph>

      <Tabs
        defaultActiveKey="1"
        type="card"
        items={[
          {
            key: '1',
            label: <span><UserOutlined /> Username</span>,
            children: <UsernameSearch />,
          },
          {
            key: '2',
            label: <span><MailOutlined /> Email</span>,
            children: <EmailLookup />,
          },
          {
            key: '3',
            label: <span><PhoneOutlined /> Phone</span>,
            children: <PhoneLookup />,
          },
          {
            key: '4',
            label: <span><FileSearchOutlined /> Metadata</span>,
            children: <MetadataExtractor />,
          },
        ]}
      />
    </div>
  );
};

export default OsintTools;
