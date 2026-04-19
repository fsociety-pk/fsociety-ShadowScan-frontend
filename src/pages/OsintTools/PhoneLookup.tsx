import React, { useState } from 'react';
import { Input, Button, Card, Typography, message, Space, Descriptions, Tag, Alert, Row, Col, Progress } from 'antd';
import { 
  SearchOutlined, 
  PhoneOutlined, 
  GlobalOutlined, 
  DeploymentUnitOutlined, 
  FlagOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Text, Paragraph } = Typography;

const PhoneLookup: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async () => {
        if (!phone || phone.trim().length < 5) {
            message.error('Please enter a valid phone number.');
            return;
        }

        setLoading(true);
        setData(null);
        setError(null);

        try {
            const response = await api.post('/tools/phone-lookup-pk', { phone });
            
            if (response.data.status === 'success') {
                setData(response.data);
                message.success('Telephony signature verified.');
            } else {
                setError(response.data.message || 'Verification failed.');
                message.warning(response.data.message || 'Verification failed.');
            }
        } catch (err: any) {
            console.error('Lookup error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to connect to telephony engine.';
            setError(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'VERIFIED': return '#3fb950'; // Green
            case 'LIKELY_VALID': return '#d29922'; // Yellow
            case 'SUSPICIOUS': return '#f0883e'; // Orange
            case 'INVALID': return '#f85149'; // Red
            default: return '#8b949e';
        }
    };

    const getOperatorColor = (name: string) => {
        const ops: any = {
            'JAZZ': '#FFD700',
            'ZONG': '#CC0000',
            'TELENOR': '#000000',
            'UFONE': '#FF6600',
            'WARID': '#0066CC'
        };
        return ops[name?.toUpperCase()] || '#00ff41';
    };

    return (
        <Card style={{ background: '#0d1117', border: '1px solid #30363d' }}>
            <Title level={4} style={{ color: '#00ff41', marginTop: 0 }}>
                [ Pakistan Telephony Intelligence v3.0 ]
            </Title>
            <Paragraph style={{ color: '#8b949e', marginBottom: 20 }}>
                High-fidelity forensic analysis of Pakistani telephony signatures. 
                Supports MNO prefix mapping, Structural validation, and Geographic area code resolving.
            </Paragraph>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Input
                        size="large"
                        placeholder="e.g. 03001234567 or +92300..."
                        prefix={<PhoneOutlined style={{ color: '#00ff41' }} />}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onPressEnter={handleLookup}
                        style={{ background: '#010409', borderColor: '#30363d', color: '#00ff41' }}
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<SearchOutlined />}
                        loading={loading}
                        onClick={handleLookup}
                        style={{ background: '#238636', borderColor: '#238636' }}
                    >
                        EXAMINE
                    </Button>
                </div>

                {error && (
                    <Alert
                        message="Telephony Engine Error"
                        description={
                            <div>
                                <p>{error}</p>
                                <p style={{ fontSize: '12px' }}>
                                    Expected format: Pakistani number starting with 0 or +92 (e.g., 03001234567)
                                </p>
                            </div>
                        }
                        type="error"
                        showIcon
                        style={{ background: '#1c1111', border: '1px solid #f8514933', color: '#f85149' }}
                    />
                )}

                {!data && !loading && !error && (
                    <Alert
                        message="System Ready"
                        description="Enter a Pakistani mobile or landline number to begin forensic analysis. Database includes Jazz, Zong, Telenor, Ufone, Warid, and regional PTCL area codes."
                        type="info"
                        showIcon
                        icon={<InfoCircleOutlined style={{ color: '#00ff41' }} />}
                        style={{ background: '#010409', border: '1px solid #30363d', color: '#8b949e' }}
                    />
                )}

                {data && (
                    <div className="telephony-results">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Card size="small" style={{ background: '#010409', borderColor: '#30363d' }}>
                                    <Title level={5} style={{ color: '#00ff41' }}><FlagOutlined /> Identity & Type</Title>
                                    <Descriptions column={1} size="small" bordered={false}>
                                        <Descriptions.Item label={<Text style={{ color: '#8b949e' }}>Category</Text>}>
                                            <Tag color="#1f1f1f" style={{ color: '#00ff41', border: '1px solid #30363d' }}>
                                                {data.validation.number_type.toUpperCase()}
                                            </Tag>
                                        </Descriptions.Item>
                                        
                                        {data.operator && (
                                            <>
                                                <Descriptions.Item label={<Text style={{ color: '#8b949e' }}>Carrier</Text>}>
                                                    <Tag color={getOperatorColor(data.operator.name)} style={{ color: data.operator.name.toUpperCase() === 'TELENOR' ? '#fff' : '#000', fontWeight: 'bold' }}>
                                                        {data.operator.name.toUpperCase()}
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<Text style={{ color: '#8b949e' }}>Network</Text>}>
                                                    <Text style={{ color: '#e6edf3' }}>{data.operator.network_type}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<Text style={{ color: '#8b949e' }}>Bands</Text>}>
                                                    <Text style={{ color: '#8b949e' }}>{data.operator.technologies.join(' · ')}</Text>
                                                </Descriptions.Item>
                                            </>
                                        )}

                                        {data.location && (
                                            <>
                                                <Descriptions.Item label={<Text style={{ color: '#8b949e' }}>Location</Text>}>
                                                    <Text style={{ color: '#e6edf3' }}>{data.location.city}, {data.location.province}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<Text style={{ color: '#8b949e' }}>Area Code</Text>}>
                                                    <Tag color="#1f1f1f">{data.location.area_code}</Tag>
                                                </Descriptions.Item>
                                            </>
                                        )}
                                    </Descriptions>
                                </Card>
                            </Col>

                            <Col xs={24} md={12}>
                                <Card size="small" style={{ background: '#010409', borderColor: '#30363d' }}>
                                    <Title level={5} style={{ color: '#00ff41' }}><DeploymentUnitOutlined /> Formats & Timing</Title>
                                    <Descriptions column={1} size="small" bordered={false}>
                                        <Descriptions.Item label={<Text style={{ color: '#8b949e' }}>Input</Text>}>
                                            <Text code style={{ color: '#8b949e', background: 'transparent' }}>{data.input_original}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Text style={{ color: '#8b949e' }}>E.164</Text>}>
                                            <Text code style={{ color: '#00ff41', background: 'transparent' }}>{data.input_normalized}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Text style={{ color: '#8b949e' }}>Latency</Text>}>
                                            <Space><HistoryOutlined style={{ color: '#8b949e' }} /> {data.metadata.extraction_time_ms}ms</Space>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Text style={{ color: '#8b949e' }}>Region</Text>}>
                                            <Space><GlobalOutlined style={{ color: '#00ff41' }} /> Pakistan (PKT)</Space>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                        </Row>

                        <div style={{ marginTop: 16 }}>
                            <Card size="small" style={{ background: '#010409', borderColor: getStatusColor(data.forensic_status) }}>
                                <Row align="middle" justify="space-between">
                                    <Col span={16}>
                                        <Title level={5} style={{ color: getStatusColor(data.forensic_status), marginBottom: 4 }}>
                                            <SafetyCertificateOutlined /> Forensic Status: {data.forensic_status}
                                        </Title>
                                        <Text style={{ color: '#8b949e' }}>
                                            {data.forensic_status === 'VERIFIED' ? 'Number structural signature matches operator database.' : 
                                             data.forensic_status === 'LIKELY_VALID' ? 'Valid Pakistani number but unrecognized operator prefix.' :
                                             data.forensic_status === 'SUSPICIOUS' ? 'Unusual structural signature detected.' : 
                                             'Does not match Pakistan numbering plan.'}
                                        </Text>
                                    </Col>
                                    <Col span={6} style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: '#8b949e' }}>CONFIDENCE</div>
                                        <Title level={3} style={{ color: '#00ff41', margin: 0 }}>
                                            {Math.round(data.confidence_score * 100)}%
                                        </Title>
                                        <Progress 
                                            percent={Math.round(data.confidence_score * 100)} 
                                            showInfo={false} 
                                            strokeColor="#00ff41" 
                                            trailColor="#30363d" 
                                            size="small" 
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        </div>
                    </div>
                )}
            </Space>
        </Card>
    );
};

export default PhoneLookup;
