import React, { useState } from 'react';
import { Card, Typography, Input, Button, Space, Divider, message, Row, Col } from 'antd';
import { SearchOutlined, GlobalOutlined, PictureOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const ReverseImageSearch: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');

  const generateLinks = () => {
    if (!imageUrl || !imageUrl.startsWith('http')) {
      message.error('Please enter a valid image URL starting with http:// or https://');
      return;
    }
    
    const encodedUrl = encodeURIComponent(imageUrl);

    const links = [
      { name: 'Yandex', url: `https://yandex.com/images/search?rpt=imageview&url=${encodedUrl}` },
      { name: 'Google Lens', url: `https://lens.google.com/uploadbyurl?url=${encodedUrl}` },
      { name: 'Bing', url: `https://www.bing.com/images/search?q=imgurl:${encodedUrl}&view=detailv2&iss=sbi&FORM=IRSBIQ` },
      { name: 'TinEye', url: `https://tineye.com/search?url=${encodedUrl}` }
    ];

    links.forEach(link => {
      window.open(link.url, '_blank');
    });
    
    message.success('Opened search tabs for Yandex, Google Lens, Bing, and TinEye.');
  };

  return (
    <Card style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 12 }}>
      <Title level={4} style={{ color: 'var(--primary)', marginTop: 0 }}>
        [ Picture OSINT ]
      </Title>
      <Paragraph style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
        Find relevant pictures, profiles, and geographical locations using reverse image search across multiple search engines like Yandex, Google, and Bing.
      </Paragraph>

      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input
            size="large"
            placeholder="Paste public image URL (e.g. https://example.com/image.jpg)"
            prefix={<PictureOutlined style={{ color: 'var(--text-muted)' }} />}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onPressEnter={generateLinks}
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={generateLinks}
            className="cyber-btn"
            style={{ borderRadius: 10, height: 48 }}
          >
            SEARCH ALL
          </Button>
        </div>

        {imageUrl && imageUrl.startsWith('http') && (
          <div style={{ marginTop: 20 }}>
            <Text style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>Preview:</Text>
            <div style={{ padding: 10, border: '1px solid var(--border-color)', borderRadius: 8, display: 'inline-block', background: '#f8fafc' }}>
              <img src={imageUrl} alt="Target" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }} onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Invalid+Image+URL';
              }} />
            </div>
            
            <Divider style={{ borderColor: 'var(--border-color)' }} />
            
            <Title level={5} style={{ color: 'var(--text-main)' }}>Manual Search Links</Title>
            <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
              {['Yandex', 'Google Lens', 'Bing', 'TinEye'].map(engine => {
                 let searchUrl = '';
                 const enc = encodeURIComponent(imageUrl);
                 if (engine === 'Yandex') searchUrl = `https://yandex.com/images/search?rpt=imageview&url=${enc}`;
                 if (engine === 'Google Lens') searchUrl = `https://lens.google.com/uploadbyurl?url=${enc}`;
                 if (engine === 'Bing') searchUrl = `https://www.bing.com/images/search?q=imgurl:${enc}&view=detailv2&iss=sbi`;
                 if (engine === 'TinEye') searchUrl = `https://tineye.com/search?url=${enc}`;

                 return (
                   <Col xs={12} md={6} key={engine}>
                     <Button 
                       block 
                       type="default" 
                       icon={<GlobalOutlined />} 
                       onClick={() => window.open(searchUrl, '_blank')}
                     >
                       {engine}
                     </Button>
                   </Col>
                 );
              })}
            </Row>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ReverseImageSearch;
