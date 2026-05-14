import React, { useState, useRef } from 'react';
import { 
  Upload, Card, Typography, message, Space, Descriptions, Divider, Tag, 
  Button, Row, Col, List, Alert, Progress, Tooltip 
} from 'antd';
import { 
  InboxOutlined, 
  FileSearchOutlined, 
  PictureOutlined, 
  EnvironmentOutlined, 
  SafetyOutlined, 
  HistoryOutlined, 
  AudioOutlined, 
  VideoCameraOutlined,
  GlobalOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  CopyOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import api from '../../api/axiosConfig';
import axios from 'axios';

const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;

const MetadataExtractor: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState<any>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState<string>('0 B/s');
    const [eta, setEta] = useState<string>('0s');
    const [uploading, setUploading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        
        // Basic Type Validation
        const supportedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/bmp', 'image/webp',
            'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg',
            'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'
        ];

        if (!supportedTypes.includes(file.type) && !file.name.match(/\.(docx|xlsx|pptx|mkv|avi|flac)$/i)) {
            message.warning('File type detected as atypical. Proceeding with caution...');
        }

        if (file.size > 100 * 1024 * 1024) {
            message.error('File exceeds 100MB limit.');
            onError(new Error('File too large'));
            return;
        }

        setLoading(true);
        setUploading(true);
        setMetadata(null);
        setUploadProgress(0);
        
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const formData = new FormData();
        formData.append('file', file);

        const startTime = Date.now();

        try {
            const response = await api.post('/tools/extract-metadata', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                signal: abortController.signal,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percent);

                        // Calculate speed
                        const timeElapsed = (Date.now() - startTime) / 1000;
                        const speed = progressEvent.loaded / timeElapsed; // bytes per sec
                        setUploadSpeed(formatBytes(speed) + '/s');

                        // Calculate ETA
                        const remainingBytes = progressEvent.total - progressEvent.loaded;
                        const etaSeconds = speed > 0 ? Math.round(remainingBytes / speed) : 0;
                        setEta(etaSeconds > 60 ? `${Math.floor(etaSeconds/60)}m ${etaSeconds%60}s` : `${etaSeconds}s`);
                    }
                }
            });
            
            setMetadata(response.data);
            onSuccess(response.data);
            message.success('Forensic analysis complete.');
        } catch (error: any) {
            if (axios.isCancel(error)) {
                message.info('Upload cancelled by user.');
            } else {
                console.error('Extraction error:', error);
                const errorMsg = error.response?.data?.message || 'Forensic analysis failed.';
                message.error(errorMsg);
                onError(error);
            }
        } finally {
            setLoading(false);
            setUploading(false);
            abortControllerRef.current = null;
        }
    };

    const cancelUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const getRiskColor = (level: string) => {
        switch (level?.toUpperCase()) {
            case 'CRITICAL': return 'var(--error)';
            case 'HIGH': return 'var(--error)';
            case 'MEDIUM': return 'var(--warning)';
            case 'LOW': return 'var(--success)';
            default: return 'var(--border-color)';
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        message.success(`${label} copied to clipboard.`);
    };

    const exportMetadata = (format: 'json' | 'csv') => {
        if (!metadata) return;
        
        let content = '';
        let type = '';
        let filename = `metadata_${Date.now()}.${format}`;

        if (format === 'json') {
            content = JSON.stringify(metadata, null, 2);
            type = 'application/json';
        } else {
            // Simplified CSV conversion
            const rows = [];
            rows.push(['Section', 'Field', 'Value']);
            
            // Flatten basic sections
            if (metadata.file_info) {
                Object.entries(metadata.file_info).forEach(([k, v]) => rows.push(['FileInfo', k, String(v)]));
            }
            if (metadata.hashing) {
                Object.entries(metadata.hashing).forEach(([k, v]) => rows.push(['Hashing', k, String(v)]));
            }
            
            content = rows.map(r => r.join(',')).join('\n');
            type = 'text/csv';
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Card style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <Title level={4} style={{ color: 'var(--primary)', marginTop: 0 }}>
                <FileSearchOutlined /> [ Advanced Metadata Forensic Engine ]
            </Title>
            <Paragraph style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Deep-layer extraction orchestration. Reveal hardware fingerprints, reverse geocoded paths, and modification intelligence.
            </Paragraph>

            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                {/* PART A & B: Upload UI */}
                {!metadata && !uploading && (
                    <Dragger
                        customRequest={handleUpload}
                        multiple={false}
                        showUploadList={false}
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', padding: '30px' }}
                        disabled={loading}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ color: 'var(--primary)' }} />
                        </p>
                        <p className="ant-upload-text" style={{ color: 'var(--text-main)' }}>Intercept File for Analysis</p>
                        <p className="ant-upload-hint" style={{ color: 'var(--text-muted)' }}>
                            Drag and drop or click to upload. Supports Images, Office Docs, PDF, Audio, and Video.
                        </p>
                    </Dragger>
                )}

                {/* PART B & C: Progress & Loading */}
                {uploading && (
                    <Card style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                        <Space orientation="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                <Text style={{ color: 'var(--primary)' }}><ClockCircleOutlined /> {uploadProgress < 100 ? 'Uploading...' : 'Processing Metadata...'}</Text>
                                {uploadProgress < 100 && <Text>{uploadSpeed} | ETA: {eta}</Text>}
                            </div>
                            <Progress 
                                percent={uploadProgress === 100 && loading ? 100 : uploadProgress} 
                                status={uploadProgress === 100 && loading ? 'active' : 'normal'}
                                strokeColor="var(--primary)" 
                                trailColor="var(--border-color)"
                                showInfo={false}
                            />
                            <div style={{ textAlign: 'right', marginTop: 10 }}>
                                <Button size="small" danger icon={<CloseCircleOutlined />} onClick={cancelUpload}>
                                    Terminate Uplink
                                </Button>
                            </div>
                        </Space>
                    </Card>
                )}

                {metadata && (
                    <div className="forensic-results">
                        <Space style={{ marginBottom: 20 }}>
                            <Button size="small" icon={<DownloadOutlined />} onClick={() => exportMetadata('json')}>Export JSON</Button>
                            <Button size="small" icon={<DownloadOutlined />} onClick={() => exportMetadata('csv')}>Export CSV</Button>
                            <Button size="small" danger type="primary" onClick={() => setMetadata(null)}>New Analysis</Button>
                        </Space>

                        <Row gutter={[16, 16]}>
                            {/* SECTION 9: Privacy Assessment Dashboard */}
                            <Col span={24}>
                                <Card size="small" style={{ background: 'rgba(255,255,255,0.02)', borderColor: getRiskColor(metadata.privacy_assessment?.risk_level) }}>
                                    <Row align="middle" gutter={24}>
                                        <Col xs={24} md={6} style={{ textAlign: 'center' }}>
                                            <Progress 
                                                type="dashboard" 
                                                percent={metadata.privacy_assessment?.risk_score} 
                                                strokeColor={getRiskColor(metadata.privacy_assessment?.risk_level)}
                                                trailColor="var(--border-color)"
                                                format={(percent) => (
                                                    <div style={{ color: getRiskColor(metadata.privacy_assessment?.risk_level) }}>
                                                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{percent}%</div>
                                                        <div style={{ fontSize: '10px' }}>RISK</div>
                                                    </div>
                                                )}
                                            />
                                        </Col>
                                        <Col xs={24} md={18}>
                                            <Title level={5} style={{ color: getRiskColor(metadata.privacy_assessment?.risk_level), marginTop: 0 }}>
                                                <SafetyOutlined /> {metadata.privacy_assessment?.risk_level} PRIVACY THREAT DETECTED
                                            </Title>
                                            <List
                                                size="small"
                                                dataSource={metadata.privacy_assessment?.risks}
                                                renderItem={(risk: any) => (
                                                    <List.Item style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        <Space>
                                                            <WarningOutlined style={{ color: getRiskColor(risk.severity) }} />
                                                            <Text style={{ color: 'var(--text-main)' }}>{risk.description}</Text>
                                                            <Tag color={getRiskColor(risk.severity)}>{risk.severity}</Tag>
                                                        </Space>
                                                    </List.Item>
                                                )}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            {/* SECTION 1: File Dossier */}
                            <Col xs={24} md={8}>
                                <Card size="small" title={<span style={{ color: 'var(--primary)' }}><FileSearchOutlined /> File Information</span>} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', height: '100%' }}>
                                    <Descriptions column={1} size="small" bordered={false}>
                                        <Descriptions.Item label={<Text type="secondary">Filename</Text>}><Text ellipsis style={{ width: 120, color: 'var(--text-main)' }}>{metadata.file_info?.filename}</Text></Descriptions.Item>
                                        <Descriptions.Item label={<Text type="secondary">Size</Text>}><Tag color="blue">{metadata.file_info?.file_size_readable}</Tag></Descriptions.Item>
                                        <Descriptions.Item label={<Text type="secondary">MIME Type</Text>}><Text code>{metadata.file_info?.file_type}</Text></Descriptions.Item>
                                        <Descriptions.Item label={<Text type="secondary">Upload Date</Text>}><Text style={{ color: 'var(--text-muted)' }}>{new Date(metadata.file_info?.upload_date).toLocaleString()}</Text></Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            {/* SECTION 7: Hashing & Integrity */}
                            <Col xs={24} md={16}>
                                <Card size="small" title={<span style={{ color: 'var(--primary)' }}><DashboardOutlined /> Cryptographic Hashing</span>} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', height: '100%' }}>
                                    <Space orientation="vertical" style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text type="secondary">MD5</Text>
                                            <Space>
                                                <Text code style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>{metadata.hashing?.md5}</Text>
                                                <Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(metadata.hashing?.md5, 'MD5')} />
                                            </Space>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text type="secondary">SHA-256</Text>
                                            <Space>
                                                <Text code style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>{metadata.hashing?.sha256.substring(0, 32)}...</Text>
                                                <Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(metadata.hashing?.sha256, 'SHA-256')} />
                                            </Space>
                                        </div>
                                    </Space>
                                </Card>
                            </Col>

                            {/* SECTION 3: Geolocation Intelligence */}
                            {metadata.gps_data && (
                                <Col span={24}>
                                    <Card size="small" title={<span style={{ color: 'var(--error)' }}><EnvironmentOutlined /> Satellite Geolocation</span>} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--error)' }}>
                                        <Row gutter={24}>
                                            <Col xs={24} md={10}>
                                                <Descriptions column={1} size="small" bordered={false}>
                                                    <Descriptions.Item label={<Text type="secondary">Latitude</Text>}><Text strong style={{ color: 'var(--text-main)' }}>{metadata.gps_data.latitude}</Text></Descriptions.Item>
                                                    <Descriptions.Item label={<Text type="secondary">Longitude</Text>}><Text strong style={{ color: 'var(--text-main)' }}>{metadata.gps_data.longitude}</Text></Descriptions.Item>
                                                    <Descriptions.Item label={<Text type="secondary">Altitude</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.gps_data.altitude || 'Unknown'} m</Text></Descriptions.Item>
                                                    <Descriptions.Item label={<Text type="secondary">GPS Date</Text>}><Text style={{ color: 'var(--text-muted)' }}>{metadata.gps_data.gps_date || 'N/A'}</Text></Descriptions.Item>
                                                    <Descriptions.Item label={<Text type="secondary">Address</Text>}>
                                                        <Text style={{ color: 'var(--primary)' }}>{metadata.gps_data.address?.full_address || 'Unresolved'}</Text>
                                                    </Descriptions.Item>
                                                </Descriptions>
                                                <Space style={{ marginTop: 20 }}>
                                                    <Button type="primary" danger icon={<GlobalOutlined />} href={metadata.gps_data.maps?.google_maps} target="_blank">Google Maps</Button>
                                                    <Button ghost icon={<EnvironmentOutlined />} href={metadata.gps_data.maps?.openstreetmap} target="_blank">OpenStreetMap</Button>
                                                </Space>
                                            </Col>
                                            <Col xs={24} md={14}>
                                                <div style={{ width: '100%', height: '250px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                                    <iframe 
                                                        title="Forensic Map"
                                                        width="100%" 
                                                        height="100%" 
                                                        frameBorder="0" 
                                                        scrolling="no" 
                                                        marginHeight={0} 
                                                        marginWidth={0} 
                                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${metadata.gps_data.longitude-0.01}%2C${metadata.gps_data.latitude-0.01}%2C${metadata.gps_data.longitude+0.01}%2C${metadata.gps_data.latitude+0.01}&layer=mapnik&marker=${metadata.gps_data.latitude}%2C${metadata.gps_data.longitude}`}
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            )}

                            {/* SECTION 2 & 5: EXIF & Image Properties */}
                            {metadata.exif_data && (
                                <Col xs={24} md={12}>
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><PictureOutlined /> EXIF Forensic Data</span>} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                                        <Descriptions column={2} size="small">
                                            <Descriptions.Item label={<Text type="secondary">Make</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.exif_data.camera?.make}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Model</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.exif_data.camera?.model}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">ISO</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.exif_data.exposure?.iso}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Aperture</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.exif_data.exposure?.aperture}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Shutter</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.exif_data.exposure?.shutter_speed}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">DPI</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.image_properties?.resolution}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Dim.</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.image_properties?.width}x{metadata.image_properties?.height}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Color</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.image_properties?.color_mode}</Text></Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>
                            )}

                            {/* SECTION 8: Device Fingerprint */}
                            {metadata.device_fingerprint && (
                                <Col xs={24} md={12}>
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><InfoCircleOutlined /> Device Fingerprint</span>} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                                        <Descriptions column={1} size="small">
                                            <Descriptions.Item label={<Text type="secondary">Identifier</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.device_fingerprint.device_model || 'Unknown'}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Software</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.device_fingerprint.software_version || 'N/A'}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Unique ID</Text>}>
                                                <Tooltip title={metadata.device_fingerprint.unique_id}>
                                                    <Text code style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(metadata.device_fingerprint.unique_id, 'Device ID')}>
                                                        {metadata.device_fingerprint.unique_id.substring(0, 16)}...
                                                    </Text>
                                                </Tooltip>
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>
                            )}

                            {/* SECTION 6: Document Intelligence */}
                            {metadata.document_properties && (
                                <Col span={24}>
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><HistoryOutlined /> Document Intelligence</span>} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                                        <Descriptions column={3} size="small">
                                            <Descriptions.Item label={<Text type="secondary">Author</Text>}><Text strong style={{ color: 'var(--primary)' }}>{metadata.document_properties.author || 'Redacted'}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Revision</Text>}><Text style={{ color: 'var(--text-main)' }}>v{metadata.document_properties.revision_count || 1}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Software</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.document_properties.software}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Page Count</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.document_properties.page_count || 0}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Created</Text>}><Text style={{ color: 'var(--text-main)' }}>{new Date(metadata.document_properties.created).toLocaleDateString()}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Modified</Text>}><Text style={{ color: 'var(--text-main)' }}>{new Date(metadata.document_properties.modified).toLocaleDateString()}</Text></Descriptions.Item>
                                        </Descriptions>
                                        {metadata.document_properties.keywords && (
                                            <div style={{ marginTop: 10 }}>
                                                <Text type="secondary">Keywords: </Text>
                                                <Text italic style={{ color: 'var(--text-main)' }}>{metadata.document_properties.keywords}</Text>
                                            </div>
                                        )}
                                    </Card>
                                </Col>
                            )}

                            {/* SECTION 4: IPTC Metadata */}
                            {metadata.iptc_data && metadata.iptc_data.creator && (
                                <Col span={24}>
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><InfoCircleOutlined /> IPTC Forensic Records</span>} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                                        <Descriptions column={2} size="small">
                                            <Descriptions.Item label={<Text type="secondary">Creator</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.iptc_data.creator}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Copyright</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.iptc_data.copyright}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Location</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.iptc_data.location}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Keywords</Text>}>
                                                {metadata.iptc_data.keywords?.map((k: string) => <Tag key={k} color="cyan">{k}</Tag>)}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>
                            )}

                             {/* Multimedia Metadata */}
                             {metadata.audio_metadata && (
                                <Col span={24}>
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><AudioOutlined /> Audio Forensic Data</span>} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                                        <Descriptions column={3} size="small">
                                            <Descriptions.Item label={<Text type="secondary">Title</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.audio_metadata.title}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Artist</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.audio_metadata.artist}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Album</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.audio_metadata.album}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Duration</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.audio_metadata.duration_readable}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Bitrate</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.audio_metadata.bitrate}</Text></Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>
                            )}

                            {metadata.video_metadata && (
                                <Col span={24}>
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><VideoCameraOutlined /> Video Stream Forensic</span>} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                                        <Descriptions column={3} size="small">
                                            <Descriptions.Item label={<Text type="secondary">Resolution</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.video_metadata.resolution}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Codec</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.video_metadata.video_codec}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Bitrate</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.video_metadata.bitrate_mbps} Mbps</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">Duration</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.video_metadata.duration_readable}</Text></Descriptions.Item>
                                            <Descriptions.Item label={<Text type="secondary">FPS</Text>}><Text style={{ color: 'var(--text-main)' }}>{metadata.video_metadata.frame_rate}</Text></Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>
                            )}
                        </Row>

                        <Divider style={{ borderColor: 'var(--border-color)' }} />
                        
                        <Alert
                            message="Extraction Metadata"
                            description={`Processed by ${metadata.metadata?.tools_used?.join(', ')} in ${metadata.metadata?.extraction_time_ms}ms.`}
                            type="success"
                            showIcon
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                        />
                    </div>
                )}

                {/* Recommendations Alert */}
                {metadata && metadata.privacy_assessment?.recommendations?.length > 0 && (
                    <Alert
                        message="Counter-Forensic Mitigation"
                        description={
                            <ul>
                                {metadata.privacy_assessment.recommendations.map((rec: string, i: number) => (
                                    <li key={i}>{rec}</li>
                                ))}
                            </ul>
                        }
                        type="warning"
                        showIcon
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--warning)' }}
                    />
                )}
            </Space>
        </Card>
    );
};

export default MetadataExtractor;
