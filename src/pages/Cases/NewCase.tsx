/**
 * NewCase — Intelligence dossier creation with AI-powered report generation.
 *
 * Users paste raw intelligence findings using a guided free-text format:
 *   "contact: +923001234567"
 *   "friend: John Doe"
 *   "email: target@example.com"
 *   "username: shadow_hacker99"
 *
 * They can also attach images (with labels) for multimodal AI analysis.
 * The Claude AI engine processes all inputs, extracts relationships,
 * applies colour-coded tags, and produces a structured forensic report.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Card, Typography, Form, Input, Select, Button, message,
  Row, Col, Space, Tag, Divider, Alert, Segmented,
} from 'antd';
import ProfessionalProgress from '../../components/ProfessionalProgress';
import {
  PlusOutlined, UserOutlined, GlobalOutlined, MailOutlined,
  PhoneOutlined, RobotOutlined, CompassOutlined, FileSearchOutlined,
  SafetyCertificateOutlined, PictureOutlined, DeleteOutlined,
  InfoCircleOutlined, CheckCircleOutlined, BulbOutlined, LinkOutlined,
  ThunderboltOutlined, MinusCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/** An image the user has attached with an optional label. */
interface AttachedImage {
  id: string;
  label: string;
  dataUrl: string;
  fileName: string;
}

interface StructuredFindingRow {
  id: string;
  label: string;
  value: string;
}

const STRUCTURED_LABELS = [
  'contact',
  'friend',
  'email',
  'username',
  'location',
  'ip',
  'domain',
  'vehicle',
  'employer',
  'organization',
  'telegram',
  'discord',
  'note',
];

/** Example raw-findings hint lines shown in the textarea placeholder. */
const RAW_PLACEHOLDER = `Paste your findings here — label each piece of data so the AI can build relationships:

contact: +923001234567
friend: Ahmed Khan (met on Facebook)
email: target@gmail.com
username: shadow_hacker99
location: Lahore, Pakistan
ip: 192.168.1.100
domain: suspicioussite.net
vehicle: Honda Civic, ABC-1234
employer: XYZ Corporation
note: target active between 10pm-2am daily`;

const buildRawFromStructured = (rows: StructuredFindingRow[]): string =>
  rows
    .map((row) => `${row.label.trim()}: ${row.value.trim()}`)
    .filter((line) => line !== ':')
    .join('\n');

const parseRawToStructured = (raw: string): StructuredFindingRow[] =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(':');
      return {
        id: `${Date.now()}-${Math.random()}`,
        label: (label || 'note').trim().toLowerCase(),
        value: rest.join(':').trim(),
      };
    })
    .filter((row) => row.value);

const NewCase: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [inputMode, setInputMode] = useState<'raw' | 'structured'>('raw');
  const [structuredRows, setStructuredRows] = useState<StructuredFindingRow[]>([
    { id: 'row-1', label: 'contact', value: '' },
    { id: 'row-2', label: 'note', value: '' },
  ]);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitStep, setSubmitStep] = useState('Idle');
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOCAL STORAGE PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('shadowScanNewCaseState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formValues) form.setFieldsValue(parsed.formValues);
        if (parsed.structuredRows) setStructuredRows(parsed.structuredRows);
        if (parsed.inputMode) setInputMode(parsed.inputMode);
        if (parsed.attachedImages) setAttachedImages(parsed.attachedImages);
      } catch (e) {
        console.error('Failed to parse saved case state');
      }
    }
  }, [form]);

  // Save to local storage whenever form or structured rows change
  const saveToLocalStorage = () => {
    const stateToSave = {
      formValues: form.getFieldsValue(),
      structuredRows,
      inputMode,
      attachedImages
    };
    localStorage.setItem('shadowScanNewCaseState', JSON.stringify(stateToSave));
  };

  useEffect(() => {
    saveToLocalStorage();
  }, [structuredRows, inputMode, attachedImages]);

  /** Read a File as a base64 data URL. */
  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  /** Handle image file selection — up to 5 images at once. */
  const handleImageFiles = async (files: FileList | null) => {
    if (!files) return;
    const toAdd = Array.from(files).slice(0, 5 - attachedImages.length);
    const newImgs: AttachedImage[] = await Promise.all(
      toAdd.map(async (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        label: file.name.replace(/\.[^.]+$/, ''),
        dataUrl: await readFileAsDataUrl(file),
        fileName: file.name,
      }))
    );
    setAttachedImages(prev => [...prev, ...newImgs]);
  };

  const removeImage = (id: string) =>
    setAttachedImages(prev => prev.filter(img => img.id !== id));

  const updateImageLabel = (id: string, label: string) =>
    setAttachedImages(prev => prev.map(img => img.id === id ? { ...img, label } : img));

  const addStructuredRow = () => {
    setStructuredRows((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, label: 'note', value: '' },
    ]);
  };

  const removeStructuredRow = (id: string) => {
    setStructuredRows((prev) => prev.filter((row) => row.id !== id));
  };

  const updateStructuredRow = (id: string, patch: Partial<StructuredFindingRow>) => {
    setStructuredRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  /** Submit: create the case record + trigger AI report. */
  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    setSubmitProgress(0);
    setSubmitStep('Preparing intelligence payload...');
    const progressTicker = setInterval(() => {
      setSubmitProgress((p) => (p >= 92 ? 92 : p + Math.random() * 8));
    }, 500);

    try {
      const structuredRaw = buildRawFromStructured(structuredRows);
      const finalRawFindings =
        inputMode === 'structured'
          ? structuredRaw || values.rawFindings || ''
          : values.rawFindings || structuredRaw;

      if (!finalRawFindings.trim()) {
        message.error('Add raw or structured findings first.');
        return;
      }

      // Build image payload for the AI
      const imagePayload = attachedImages.map(img => ({
        label: img.label,
        dataUrl: img.dataUrl,
        fileName: img.fileName,
      }));

      const payload = {
        title: values.title,
        description: finalRawFindings,
        category: values.category,
        priority: values.priority,
        rawFindings: finalRawFindings,
        images: imagePayload,
        targetProfile: {
          name: values.targetName || '',
          email: values.targetEmail || '',
          phone: values.targetPhone || '',
          socialMedia: values.targetSocial || '',
        },
      };

      setSubmitStep('Creating case dossier...');
      setSubmitProgress(28);
      const createRes = await api.post('/cases', payload);
      const caseId = createRes?.data?.id;

      if (!caseId) {
        throw new Error('Case created but ID not returned');
      }

      setSubmitStep('Generating AI intelligence report...');
      setSubmitProgress(62);
      await api.post('/reports/generate', { caseId, template: 'corporate' });

      clearInterval(progressTicker);
      setSubmitProgress(100);
      setSubmitStep('Done');
      message.success('Case created and AI report generated successfully.');
      localStorage.removeItem('shadowScanNewCaseState'); // Clear persistent state on success
      navigate(`/cases/${caseId}`);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      if ((err as { response?: { status?: number } }).response?.status === 401) {
        message.error('Unauthenticated. Please log in first.');
        navigate('/login');
      } else {
        message.error(apiErr.response?.data?.message || apiErr.message || 'Failed to initialise case');
      }
    } finally {
      clearInterval(progressTicker);
      setLoading(false);
      setTimeout(() => {
        setSubmitProgress(0);
        setSubmitStep('Idle');
      }, 1200);
    }
  };

  /** Preview what the AI will extract from the raw findings. */
  const handleAIPreview = async () => {
    const rawFindings: string =
      inputMode === 'structured'
        ? buildRawFromStructured(structuredRows)
        : form.getFieldValue('rawFindings') || '';
    if (!rawFindings.trim()) {
      message.warning('Add findings first.');
      return;
    }
    setAiLoading(true);
    setAiProgress(0);

    const progressInterval = setInterval(() => {
      setAiProgress(p => (p >= 90 ? 90 : p + Math.random() * 12));
    }, 400);

    try {
      const res = await api.post('/chat', {
        message: `Analyse these raw intelligence findings and produce a brief structured summary with: key entities (names, contacts, usernames, IPs, domains), inferred relationships, and a risk rating (Low/Medium/High/Critical). Format clearly.\n\nFindings:\n${rawFindings}`,
        history: [],
      });
      clearInterval(progressInterval);
      setAiProgress(100);
      if (res.data.success) {
        message.success({ content: res.data.reply, duration: 12 });
      }
    } catch {
      clearInterval(progressInterval);
      message.error('AI preview failed. Try again.');
    } finally {
      setAiLoading(false);
      setTimeout(() => setAiProgress(0), 1500);
    }
  };

  /** Fast-fill sample data for presentation */
  const loadSampleData = () => {
    const sampleRaw = `contact: +92 300 1234567
friend: Usman Ali (met at FAST NUCES)
email: ahmed.hacker@gmail.com
username: fsociety_pk
username: shadow_khan99
alias: Ahmed Khan
location: Islamabad, Pakistan
ip: 111.68.100.55
ip: 203.215.160.24
domain: fsociety.pk
domain: redline-mail.com.pk
github: https://github.com/fsociety_pk
x_profile: https://x.com/shadow_khan99
linkedin: Ahmed Khan - Cybersecurity Engineer
organization: Allsafe Cybersecurity Pakistan
organization: Jazz (former contractor)
wallet: 0x9b2fAa44E9f9f6f6A194d2Df8A74d1E1f89b14C2
vehicle: Honda Civic, LEB-1234
location: Blue Area, Islamabad
known_associate: Fatima Ali (device-sharing evidence)
known_associate: Tariq Mehmood (corporate communication logs)
phone: +92 333 555 0132 (secondary number observed in Telegram dump)
telegram: @shadow_ops_pk
discord: fsociety_pk#1337
data_leak_reference: Pastebin dump ID - redline_pk_0912
tool_result_sherlock: 37 social accounts found with same username pattern
tool_result_holehe: email registered on GitHub, Spotify, Dropbox, Discord, Reddit
tool_result_whatsosint: profile image available, status text "we are fsociety pk"
employer: Systems Limited
note: Late-night login pattern (02:00-05:00 PKT), recurrent VPN exits in Islamabad and Lahore, possible command-and-control coordination through disposable domains.`;

    form.setFieldsValue({
      title: 'Operation Redline Islamabad (Demo)',
      category: 'Cyber',
      priority: 'Critical',
      targetName: 'Ahmed Khan',
      targetEmail: 'ahmed.hacker@gmail.com',
      targetPhone: '+92 300 1234567',
      targetSocial: '@fsociety_pk, @shadow_khan99',
      rawFindings: sampleRaw,
    });
    setStructuredRows(parseRawToStructured(sampleRaw));
    saveToLocalStorage();
    message.success('Sample data loaded for presentation!');
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60, paddingTop: 20 }}>

      {/* ── Page Header ── */}
      <div style={{
        textAlign: 'center', marginBottom: 36, padding: '40px',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #1e293b 100%)',
        borderRadius: '16px', boxShadow: '0 10px 30px rgba(14, 165, 233, 0.2)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 10, right: 20, opacity: 0.08, fontSize: 140, color: '#fff' }}>
          <SafetyCertificateOutlined />
        </div>
        <Tag color="#0284c7" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, marginBottom: 16, border: '1px solid #bae6fd', color: '#ffffff', fontWeight: 700 }}>
          INTELLIGENCE DOSSIER CREATION
        </Tag>
        <Title
          level={1}
          style={{
            color: '#ffffff', margin: '0 0 14px', fontWeight: 800, letterSpacing: 2,
            background: 'none', WebkitBackgroundClip: 'unset', WebkitTextFillColor: '#ffffff',
          }}
        >
          NEW TARGET CLASSIFICATION
        </Title>
        <Paragraph style={{ color: '#e2e8f0', fontSize: 15, maxWidth: 700, margin: '0 auto', marginBottom: 20 }}>
          Paste your raw intelligence findings with contextual labels. The AI engine will extract entities,
          map relationships, apply colour-coded tags, and produce a structured forensic intelligence report.
        </Paragraph>
        <Button 
          type="primary" 
          icon={<ThunderboltOutlined />} 
          onClick={loadSampleData}
          style={{ 
            background: 'linear-gradient(90deg, #10b981, #059669)', 
            border: 'none', fontWeight: 700, borderRadius: 8, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' 
          }}
        >
          LOAD DUMMY DETAILED DATA
        </Button>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        requiredMark="optional"
        onValuesChange={() => saveToLocalStorage()}
      >
        <Row gutter={24}>

          {/* ── Left: Core Data ── */}
          <Col xs={24} lg={16}>

            {/* Case metadata */}
            <Card
              title={<><FileSearchOutlined style={{ color: 'var(--cyber-blue)', marginRight: 8 }} />CORE CLASSIFICATION</>}
              style={{ marginBottom: 24, borderRadius: 16, borderTop: '4px solid var(--cyber-blue)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="title" label={<Text strong style={{ color: '#1e293b' }}>Operation Codename</Text>} rules={[{ required: true, message: 'Required' }]}>
                    <Input prefix={<CompassOutlined />} placeholder="e.g. Operation Phantom" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="category" label={<Text strong style={{ color: '#1e293b' }}>Intel Category</Text>} rules={[{ required: true, message: 'Required' }]}>
                    <Select placeholder="Category" size="large">
                      <Option value="Cyber">Cyber Security</Option>
                      <Option value="Physical">Physical Search</Option>
                      <Option value="Corporate">Corporate Intel</Option>
                      <Option value="Personal">Personal Identity</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="priority" label={<Text strong style={{ color: '#1e293b' }}>Threat Level</Text>} rules={[{ required: true, message: 'Required' }]} initialValue="Medium">
                    <Select size="large">
                      <Option value="Low"><Tag color="green">Low</Tag></Option>
                      <Option value="Medium"><Tag color="orange">Medium</Tag></Option>
                      <Option value="High"><Tag color="red">High</Tag></Option>
                      <Option value="Critical"><Tag color="volcano">Critical</Tag></Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="targetName" label={<Text strong style={{ color: '#1e293b' }}>Target Alias / Name</Text>}>
                    <Input prefix={<UserOutlined />} placeholder="John Doe / hacker99" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="targetEmail" label={<Text strong style={{ color: '#1e293b' }}>Primary Email</Text>}>
                    <Input prefix={<MailOutlined />} placeholder="target@domain.com" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="targetPhone" label={<Text strong style={{ color: '#1e293b' }}>Phone (with country code)</Text>}>
                    <Input prefix={<PhoneOutlined />} placeholder="+1 234 567 8900" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="targetSocial" label={<Text strong style={{ color: '#1e293b' }}>Social Handles</Text>}>
                    <Input prefix={<GlobalOutlined />} placeholder="@username" size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* ── Raw Findings Input (the main new feature) ── */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><RobotOutlined style={{ color: 'var(--cyber-purple)', marginRight: 8 }} />RAW FINDINGS — AI INPUT MATRIX</span>
                  <Button
                    size="small"
                    icon={<BulbOutlined />}
                    loading={aiLoading}
                    onClick={handleAIPreview}
                    style={{ borderRadius: 8, fontWeight: 600, color: '#8b5cf6', borderColor: '#8b5cf6' }}
                  >
                    AI Preview
                  </Button>
                </div>
              }
              style={{ marginBottom: 24, borderRadius: 16, borderTop: '4px solid var(--cyber-purple)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ marginBottom: 16, borderRadius: 10 }}
                title="How to write raw findings"
                description={
                  <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                    Label each finding so the AI understands its type. Examples:
                    <br />
                    <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, marginRight: 6 }}>contact: +923001234567</code>
                    <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, marginRight: 6 }}>friend: Ahmed Khan</code>
                    <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, marginRight: 6 }}>email: x@y.com</code>
                    <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, marginRight: 6 }}>username: hacker99</code>
                    <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>note: active at night</code>
                    <br />
                    You can also paste raw tool output (Sherlock results, Whois data, etc.) and the AI will parse it automatically.
                  </div>
                }
              />

              <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ color: '#334155' }}>Input Mode</Text>
                <Segmented
                  value={inputMode}
                  options={[
                    { label: 'Raw Input', value: 'raw' },
                    { label: 'Structured Input', value: 'structured' },
                  ]}
                  onChange={(value) => {
                    const mode = value as 'raw' | 'structured';
                    if (mode === 'structured' && structuredRows.every((r) => !r.value.trim())) {
                      const raw = form.getFieldValue('rawFindings') || '';
                      if (raw.trim()) {
                        setStructuredRows(parseRawToStructured(raw));
                      }
                    }
                    setInputMode(mode);
                  }}
                />
              </div>

              {aiLoading && (
                <div style={{ marginBottom: 16 }}>
                  <ProfessionalProgress percent={Math.floor(aiProgress)} />
                  <Text style={{ color: '#64748b', fontSize: 12 }}>AI is analysing your findings...</Text>
                </div>
              )}

              {inputMode === 'raw' ? (
                <>
                  <Form.Item
                    name="rawFindings"
                    rules={[{ required: true, message: 'Please add raw findings for AI analysis' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <TextArea
                      rows={12}
                      placeholder={RAW_PLACEHOLDER}
                      style={{
                        fontFamily: 'Space Grotesk, monospace',
                        fontSize: 14,
                        lineHeight: 1.75,
                        borderRadius: 12,
                        background: '#f8fafc',
                        color: '#1e293b',
                        resize: 'vertical',
                      }}
                    />
                  </Form.Item>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                    {['contact:', 'friend:', 'email:', 'username:', 'location:', 'ip:', 'domain:', 'vehicle:', 'employer:', 'note:'].map(tag => (
                      <Tag
                        key={tag}
                        style={{ cursor: 'pointer', borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}
                        color="blue"
                        onClick={() => {
                          const current = form.getFieldValue('rawFindings') || '';
                          form.setFieldValue('rawFindings', current + (current.endsWith('\n') || !current ? '' : '\n') + tag + ' ');
                        }}
                      >
                        + {tag}
                      </Tag>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ border: '1px solid #dbeafe', borderRadius: 12, padding: 12, background: '#f8fbff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ color: '#334155', fontWeight: 700 }}>Structured Intelligence Rows</Text>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={addStructuredRow}>
                      Add Row
                    </Button>
                  </div>

                  <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    {structuredRows.map((row) => (
                      <Row key={row.id} gutter={8}>
                        <Col span={8}>
                          <Select
                            value={row.label}
                            style={{ width: '100%' }}
                            onChange={(val) => updateStructuredRow(row.id, { label: val })}
                            options={STRUCTURED_LABELS.map((label) => ({ label, value: label }))}
                            showSearch
                          />
                        </Col>
                        <Col span={14}>
                          <Input
                            value={row.value}
                            placeholder="Enter value"
                            onChange={(e) => updateStructuredRow(row.id, { value: e.target.value })}
                          />
                        </Col>
                        <Col span={2}>
                          <Button
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => removeStructuredRow(row.id)}
                            disabled={structuredRows.length === 1}
                          />
                        </Col>
                      </Row>
                    ))}
                  </Space>

                  <div style={{ marginTop: 12 }}>
                    <Text style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>
                      Preview:
                    </Text>
                    <pre style={{ marginTop: 6, maxHeight: 160, overflowY: 'auto', background: '#0f172a', color: '#bae6fd', padding: 10, borderRadius: 10 }}>
                      {buildRawFromStructured(structuredRows) || 'No rows yet'}
                    </pre>
                  </div>
                </div>
              )}
            </Card>

            {/* ── Image Attachments ── */}
            <Card
              title={<><PictureOutlined style={{ color: '#10b981', marginRight: 8 }} />ATTACH IMAGES — AI VISUAL ANALYSIS</>}
              style={{ marginBottom: 24, borderRadius: 16, borderTop: '4px solid #10b981', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ marginBottom: 16, borderRadius: 10 }}
                title="Label each image so the AI knows what it contains"
                description='e.g. "Profile photo from Facebook", "WhatsApp profile picture", "Screenshot of suspicious chat"'
              />

              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={e => handleImageFiles(e.target.files)}
              />

              {attachedImages.length < 5 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <Button
                    icon={<PictureOutlined />}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ flex: 1, borderRadius: 10, borderStyle: 'dashed', fontWeight: 600, color: '#10b981', borderColor: '#10b981' }}
                    size="large"
                  >
                    Upload Image
                  </Button>
                  <Button
                    icon={<LinkOutlined />}
                    onClick={() => {
                      const url = prompt('Enter image URL:');
                      if (url && url.startsWith('http')) {
                        setAttachedImages(prev => [...prev, {
                          id: `${Date.now()}-${Math.random()}`,
                          label: 'Linked Image',
                          dataUrl: url,
                          fileName: 'link',
                        }]);
                      } else if (url) {
                        message.error('Please enter a valid HTTP/HTTPS URL');
                      }
                    }}
                    style={{ flex: 1, borderRadius: 10, borderStyle: 'dashed', fontWeight: 600, color: '#10b981', borderColor: '#10b981' }}
                    size="large"
                  >
                    Add Link
                  </Button>
                </div>
              )}

              {attachedImages.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  {attachedImages.map(img => (
                    <div key={img.id} style={{
                      width: 140, borderRadius: 12, overflow: 'hidden',
                      border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      background: '#fff',
                    }}>
                      <div style={{ position: 'relative' }}>
                        <img src={img.dataUrl} alt={img.label} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                        <button
                          onClick={() => removeImage(img.id)}
                          style={{
                            position: 'absolute', top: 6, right: 6,
                            background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '50%',
                            color: '#fff', width: 22, height: 22, cursor: 'pointer', fontSize: 11,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                      <div style={{ padding: '8px 8px' }}>
                        {editingLabelId === img.id ? (
                          <Input
                            size="small"
                            value={img.label}
                            onChange={e => updateImageLabel(img.id, e.target.value)}
                            onBlur={() => setEditingLabelId(null)}
                            onPressEnter={() => setEditingLabelId(null)}
                            autoFocus
                            style={{ borderRadius: 6, fontSize: 11 }}
                          />
                        ) : (
                          <div
                            onClick={() => setEditingLabelId(img.id)}
                            style={{ fontSize: 11, color: '#475569', cursor: 'pointer', fontWeight: 600, lineHeight: 1.4 }}
                            title="Click to edit label"
                          >
                            {img.label || 'Click to label'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </Col>

          {/* ── Right: Sidebar Info + Submit ── */}
          <Col xs={24} lg={8}>

            {/* AI Engines */}
            <Card style={{ marginBottom: 24, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Title level={5} style={{ color: 'var(--cyber-blue)', background: 'none', WebkitTextFillColor: 'var(--cyber-blue)', marginTop: 0 }}>
                AI Orchestration Engines
              </Title>
              <Paragraph style={{ fontSize: 13, color: '#64748b' }}>
                These engines will run upon submission:
              </Paragraph>
              <Space orientation="vertical" style={{ width: '100%', marginBottom: 16 }}>
                <Tag color="blue" style={{ width: '100%', padding: '6px 10px', borderRadius: 8, fontWeight: 600 }}>
                  <RobotOutlined style={{ marginRight: 6 }} />Email Intelligence — Email Analysis
                </Tag>
                <Tag color="green" style={{ width: '100%', padding: '6px 10px', borderRadius: 8, fontWeight: 600 }}>
                  <RobotOutlined style={{ marginRight: 6 }} />WhatsOSINT — Phone Analysis
                </Tag>
                <Tag color="purple" style={{ width: '100%', padding: '6px 10px', borderRadius: 8, fontWeight: 600 }}>
                  <RobotOutlined style={{ marginRight: 6 }} />Sherlock — Identity Matrix
                </Tag>
                <Tag color="cyan" style={{ width: '100%', padding: '6px 10px', borderRadius: 8, fontWeight: 600 }}>
                  <RobotOutlined style={{ marginRight: 6 }} />Gemini AI — Report Generation
                </Tag>
              </Space>

              <Divider style={{ margin: '8px 0 16px' }} />

              {/* What the AI report includes */}
              <Title level={5} style={{ color: '#1e293b', background: 'none', WebkitTextFillColor: '#1e293b', marginTop: 0 }}>
                AI Report Includes
              </Title>
              {[
                { icon: <CheckCircleOutlined />, color: '#10b981', text: 'Entity extraction (names, contacts, IPs, domains)' },
                { icon: <CheckCircleOutlined />, color: '#10b981', text: 'Relationship mapping between entities' },
                { icon: <CheckCircleOutlined />, color: '#10b981', text: 'Colour-coded risk tags (Critical / High / Low)' },
                { icon: <CheckCircleOutlined />, color: '#10b981', text: 'Image analysis and facial recognition hints' },
                { icon: <CheckCircleOutlined />, color: '#10b981', text: 'Downloadable PDF forensic report' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: '#475569' }}>
                  <span style={{ color: item.color, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </Card>

            {/* Submit */}
            <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              {loading && (
                <div style={{ marginBottom: 12 }}>
                  <ProfessionalProgress percent={Math.floor(submitProgress)} />
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{submitStep}</Text>
                </div>
              )}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<PlusOutlined />}
                  loading={loading}
                  block
                  style={{
                    height: 54, borderRadius: 12, fontSize: 16, fontWeight: 700,
                    background: 'linear-gradient(90deg, #0ea5e9, #8b5cf6)',
                    border: 'none', boxShadow: '0 4px 20px rgba(14, 165, 233, 0.4)',
                  }}
                >
                  {loading ? 'GENERATING INTELLIGENCE REPORT...' : 'GENERATE REPORT'}
                </Button>
              </Form.Item>
              <Text style={{ display: 'block', textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 10 }}>
                The AI report will be generated automatically after submission.
              </Text>
            </Card>

          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default NewCase;
