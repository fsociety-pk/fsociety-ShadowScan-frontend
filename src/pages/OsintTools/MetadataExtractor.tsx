/**
 * MetadataExtractor — Deep forensic metadata analysis engine.
 * Accepts images, documents, audio, and video files and extracts EXIF data,
 * GPS coordinates, cryptographic hashes, document properties, and privacy risks.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
    Upload, Card, Typography, message, Space, Descriptions, Divider, Tag,
        Button, Row, Col, List, Alert, Tooltip,
} from 'antd';
import ProfessionalProgress from '../../components/ProfessionalProgress';
import ProfessionalProgressCircle from '../../components/ProfessionalProgressCircle';
import type { UploadProps } from 'antd';
import {
  InboxOutlined, FileSearchOutlined, PictureOutlined, EnvironmentOutlined,
  SafetyOutlined, HistoryOutlined, AudioOutlined, VideoCameraOutlined,
  GlobalOutlined, WarningOutlined, InfoCircleOutlined, DownloadOutlined,
  CopyOutlined, DashboardOutlined,
} from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;

interface MetadataExtractorProps {
  onScanStateChange?: (isScanning: boolean) => void;
}

const MetadataExtractor: React.FC<MetadataExtractorProps> = ({ onScanStateChange }) => {
  // `metadata` is an untyped JSON blob from the backend — kept loose intentionally
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (onScanStateChange) {
      onScanStateChange(loading);
    }
  }, [loading, onScanStateChange]);

  /** Custom ant-design Upload handler — sends file to the metadata extraction endpoint. */
  const handleUpload: UploadProps['customRequest'] = async (options) => {
    if (!options) return;
    const { onSuccess, onError } = options;
    const file = options.file as File;

    // Warn on non-standard types but still attempt extraction
    const supportedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/bmp', 'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg',
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm',
    ];
    if (!supportedTypes.includes(file.type) && !file.name.match(/\.(docx|xlsx|pptx|mkv|avi|flac)$/i)) {
      message.warning('File type detected as atypical. Proceeding with caution...');
    }

    if (file.size > 100 * 1024 * 1024) {
      message.error('File exceeds 100MB limit.');
      onError?.(new Error('File too large'));
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

    try {
      const response = await api.post('/tools/extract-metadata', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortController.signal,
        onUploadProgress: progressEvent => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });
      setMetadata(response.data);
      onSuccess?.(response.data);
      message.success('Forensic analysis complete.');
    } catch (error: unknown) {
      // AbortError means the user clicked "Cancel" — inform without an error toast
      if ((error as { name?: string }).name === 'AbortError' || (error as { name?: string }).name === 'CanceledError') {
        message.info('Upload cancelled by user.');
      } else {
        const apiErr = error as { response?: { data?: { message?: string } } };
        message.error(apiErr.response?.data?.message || 'Forensic analysis failed.');
        onError?.(error as Error);
      }
    } finally {
      setLoading(false);
      setUploading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelUpload = () => {
    abortControllerRef.current?.abort();
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
        const filename = `metadata_${Date.now()}.${format}`;

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
      <>
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
                        style={{ background: '#f8fafc', border: '1px dashed var(--border-color)', padding: '30px' }}
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
                    <div style={{
                      margin: '24px 0',
                      borderRadius: 16,
                      border: '1px solid #e6eefc',
                      boxShadow: '0 6px 18px rgba(16,24,40,0.03)',
                      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                      padding: '40px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      {/* Pulsing Cyber Radar Animation */}
                      <div className="radar-container" style={{ position: 'relative', width: 140, height: 140, marginBottom: 28 }}>
                        <div className="radar-circle" />
                        <div className="radar-sweep" />
                        <div className="radar-core" />
                        <FileSearchOutlined style={{
                          position: 'absolute', top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)', color: '#6366f1',
                          fontSize: 32, animation: 'pulse 1.5s infinite'
                        }} />
                      </div>

                      <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: '1px', marginBottom: 6 }}>
                          [SYSTEM ACTIVE: DEEP METADATA FORENSICS]
                      </div>

                      {/* Glowing progress bar (light theme) */}
                      <div style={{ width: '100%', maxWidth: 500, margin: '8px auto 12px' }}>
                          <ProfessionalProgress percent={uploadProgress} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 11, marginTop: 6, fontFamily: 'monospace' }}>
                              <span>{uploadProgress < 100 ? 'UPLINK IN PROGRESS' : 'FORENSIC EXTRACTION'}</span>
                              <span style={{ color: '#4f46e5', fontWeight: 700 }}>{uploadProgress}%</span>
                          </div>
                      </div>

                      {/* Step readout */}
                      <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '12px 20px',
                          borderRadius: 8,
                          width: '100%',
                          maxWidth: 500,
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: '#4f46e5',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                          <span className="blink">{'>'}</span> {
                              uploadProgress < 30 ? 'Decrypting cryptographic header segments...' :
                              uploadProgress < 60 ? 'Interrogating EXIF payload matrices...' :
                              uploadProgress < 85 ? 'Scanning file structures for hidden metadata...' :
                              'Formulating privacy threat report...'
                          }
                      </div>

                      <div style={{ marginTop: 20 }}>
                        <Button size="small" danger onClick={cancelUpload} style={{ fontFamily: 'monospace', fontSize: 11 }}>
                          Terminate Forensic Uplink
                        </Button>
                      </div>
                    </div>
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
                                <Card size="small" style={{ background: '#f8fafc', borderColor: getRiskColor(metadata.privacy_assessment?.risk_level) }}>
                                    <Row align="middle" gutter={24}>
                                        <Col xs={24} md={6} style={{ textAlign: 'center' }}>
                                            <ProfessionalProgressCircle
                                                percent={metadata.privacy_assessment?.risk_score}
                                                size={120}
                                                colors={[getRiskColor(metadata.privacy_assessment?.risk_level), getRiskColor(metadata.privacy_assessment?.risk_level)]}
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
                                <Card size="small" title={<span style={{ color: 'var(--primary)' }}><FileSearchOutlined /> File Information</span>} style={{ background: '#f8fafc', borderColor: 'var(--border-color)', height: '100%' }}>
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
                                <Card size="small" title={<span style={{ color: 'var(--primary)' }}><DashboardOutlined /> Cryptographic Hashing</span>} style={{ background: '#f8fafc', borderColor: 'var(--border-color)', height: '100%' }}>
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
                                    <Card size="small" title={<span style={{ color: 'var(--error)' }}><EnvironmentOutlined /> Satellite Geolocation</span>} style={{ background: '#f8fafc', borderColor: 'var(--error)' }}>
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
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><PictureOutlined /> EXIF Forensic Data</span>} style={{ background: '#f8fafc', borderColor: 'var(--border-color)' }}>
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
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><InfoCircleOutlined /> Device Fingerprint</span>} style={{ background: '#f8fafc', borderColor: 'var(--border-color)' }}>
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
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><HistoryOutlined /> Document Intelligence</span>} style={{ background: '#f8fafc', borderColor: 'var(--border-color)' }}>
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
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><InfoCircleOutlined /> IPTC Forensic Records</span>} style={{ background: '#f8fafc', borderColor: 'var(--border-color)' }}>
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
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><AudioOutlined /> Audio Forensic Data</span>} style={{ background: '#f8fafc', borderColor: 'var(--border-color)' }}>
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
                                    <Card size="small" title={<span style={{ color: 'var(--primary)' }}><VideoCameraOutlined /> Video Stream Forensic</span>} style={{ background: '#f8fafc', borderColor: 'var(--border-color)' }}>
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
                        style={{ background: '#f8fafc', border: '1px solid var(--warning)' }}
                    />
                )}
            </Space>
        </Card>
        
        {/* Styled custom CSS embedded */}
        <style>{`
          .radar-container {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .radar-circle {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 1px solid rgba(99, 102, 241, 0.15);
            border-radius: 50%;
          }

          .radar-sweep {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(from 0deg at 50% 50%, rgba(99, 102, 241, 0.25) 0deg, transparent 90deg);
            animation: radar-sweep 3s linear infinite;
          }

          .radar-core {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #6366f1;
            border-radius: 50%;
            box-shadow: 0 0 12px #6366f1;
          }

          @keyframes radar-sweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.6; }
          }

          .blink {
            animation: blink-anim 1s step-end infinite;
          }

          @keyframes blink-anim {
            50% { opacity: 0; }
          }
        `}</style>
      </>
    );
};

export default MetadataExtractor;
