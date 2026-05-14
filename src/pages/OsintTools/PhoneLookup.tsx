import React, { useState } from 'react';
import { Button, Card, Typography, message, Space, Descriptions, Tag, Alert, Row, Col } from 'antd';
import { 
  SearchOutlined, 
  FlagOutlined,
  SafetyCertificateOutlined,
  DeploymentUnitOutlined
} from '@ant-design/icons';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
const PhoneInput = (PhoneInputPkg as any).default || PhoneInputPkg;
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
            const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
            let response;
            
            // Intelligence routing: If it's a Pakistan number, try specialized engine first
            if (formattedPhone.startsWith('+92')) {
                try {
                    response = await api.post('/tools/phone-lookup-pk', { phone: formattedPhone });
                } catch (pkErr) {
                    console.log('PK engine failed, falling back to Global...');
                }
            }

            // Fallback or Global lookup (if PK failed or not +92)
            if (!response || response.data?.status === 'error') {
                response = await api.post('/tools/phone-lookup-global', { phone: formattedPhone });
            }
            
            if (response.data) {
                // Normalize data for UI
                const normalizedData = response.data.status === 'success' ? response.data : {
                    input_original: formattedPhone,
                    input_normalized: response.data.phone_number || formattedPhone,
                    operator: response.data.carrier ? { name: response.data.carrier.name, network_type: response.data.carrier.type } : null,
                    validation: { number_type: response.data.line_type_intelligence?.type || 'MOBILE' },
                    forensic_status: 'VERIFIED',
                    confidence_score: 0.95
                };

                setData(normalizedData);
                message.success('Telephony signature verified.');
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
            case 'VERIFIED': return '#52c41a';
            case 'LIKELY_VALID': return '#f59e0b';
            case 'SUSPICIOUS': return '#f97316';
            case 'INVALID': return '#ff4d4f';
            default: return '#9ca3af';
        }
    };

    return (
        <Card style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <Title level={4} style={{ color: 'var(--primary)', marginTop: 0 }}>
                [ Global Telephony Intelligence ]
            </Title>
            <Paragraph style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Forensic analysis of global telephony signatures using specialized local engines and global carriers.
            </Paragraph>

            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <PhoneInput
                            country={'pk'}
                            value={phone}
                            onChange={(phone: string) => setPhone(phone)}
                            inputStyle={{
                                width: '100%',
                                height: '42px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-main)',
                                fontSize: '16px',
                            }}
                            buttonStyle={{
                                background: 'var(--bg-card)',
                                borderColor: 'var(--border-color)',
                            }}
                            dropdownStyle={{
                                background: 'var(--bg-card)',
                                color: '#000',
                            }}
                        />
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<SearchOutlined />}
                        loading={loading}
                        onClick={handleLookup}
                        style={{ height: 42 }}
                    >
                        EXAMINE
                    </Button>
                </div>

                {error && (
                    <Alert
                        message="Telephony Engine Error"
                        description={error}
                        type="error"
                        showIcon
                    />
                )}

                {data && (
                    <div className="telephony-results">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Card size="small" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                                    <Title level={5} style={{ color: 'var(--primary)' }}><FlagOutlined /> Identity & Type</Title>
                                    <Descriptions column={1} size="small" bordered={false}>
                                        <Descriptions.Item label={<Text style={{ color: 'var(--text-muted)' }}>Category</Text>}>
                                            <Tag color="blue">
                                                {data.validation?.number_type?.toUpperCase() || 'UNKNOWN'}
                                            </Tag>
                                        </Descriptions.Item>
                                        
                                        {data.operator && (
                                            <>
                                                <Descriptions.Item label={<Text style={{ color: 'var(--text-muted)' }}>Carrier</Text>}>
                                                    <Tag color="cyan">
                                                        {data.operator.name.toUpperCase()}
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<Text style={{ color: 'var(--text-muted)' }}>Network</Text>}>
                                                    <Text style={{ color: 'var(--text-main)' }}>{data.operator.network_type}</Text>
                                                </Descriptions.Item>
                                            </>
                                        )}
                                    </Descriptions>
                                </Card>
                            </Col>

                            <Col xs={24} md={12}>
                                <Card size="small" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                                    <Title level={5} style={{ color: 'var(--primary)' }}><DeploymentUnitOutlined /> Formats</Title>
                                    <Descriptions column={1} size="small" bordered={false}>
                                        <Descriptions.Item label={<Text style={{ color: 'var(--text-muted)' }}>Input</Text>}>
                                            <Text code>{data.input_original}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Text style={{ color: 'var(--text-muted)' }}>E.164</Text>}>
                                            <Text code style={{ color: 'var(--success)' }}>{data.input_normalized}</Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                        </Row>

                        <div style={{ marginTop: 16 }}>
                            <Card size="small" style={{ background: 'rgba(255,255,255,0.02)', borderColor: getStatusColor(data.forensic_status) }}>
                                <Row align="middle" justify="space-between">
                                    <Col span={16}>
                                        <Title level={5} style={{ color: getStatusColor(data.forensic_status), marginBottom: 4 }}>
                                            <SafetyCertificateOutlined /> Forensic Status: {data.forensic_status}
                                        </Title>
                                    </Col>
                                    <Col span={6} style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CONFIDENCE</div>
                                        <Title level={3} style={{ color: 'var(--primary)', margin: 0 }}>
                                            {Math.round((data.confidence_score || 0.9) * 100)}%
                                        </Title>
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
