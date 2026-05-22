import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, message } from 'antd';
import api from '../api/axiosConfig';
import { PlusOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const STORAGE_KEY = 'shadowScanNewCaseState';

const QuickAddFinding: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // load any existing draft snippet (rawFindings) if present
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const raw = parsed.formValues?.rawFindings || '';
        setText(raw);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const persist = (value: string) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.formValues = parsed.formValues || {};
      parsed.formValues.rawFindings = value;
      parsed.inputMode = parsed.inputMode || 'raw';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.error('Failed to persist quick finding', e);
    }
  };

  const handleClose = () => {
    // autosave draft on close
    persist(text || '');
    setOpen(false);
    message.success('Draft saved to Quick Add');
  };

  const handleSaveAndGo = () => {
    if (!text.trim()) {
      message.error('Enter some findings before proceeding');
      return;
    }
    persist(text);
    setOpen(false);
    // navigate to New Case where the saved draft will prefill the form
    navigate('/cases/new');
    message.success('Findings saved — opening New Case');
  };

  const handleSaveServerDraft = async () => {
    if (!text.trim()) {
      message.error('Enter some findings before saving to server');
      return;
    }

    const payload = {
      title: `Quick Draft ${new Date().toLocaleString()}`,
      category: 'Other',
      priority: 'Low',
      description: text.trim(),
      rawFindings: text.trim(),
      targetProfile: {},
      images: []
    };

    try {
      const res = await api.post('/cases', payload);
      const caseId = res?.data?.id;
      if (caseId) {
        // clear local draft and navigate to the new case
        localStorage.removeItem(STORAGE_KEY);
        setOpen(false);
        message.success('Draft saved to your workspace — opening case');
        navigate(`/cases/${caseId}`);
      } else {
        message.error('Saved but server did not return case id');
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        message.error('Unauthenticated. Please log in to save drafts server-side.');
        navigate('/login');
      } else {
        message.error(err?.response?.data?.message || 'Failed to save draft to server');
      }
    }
  };

  const handleSaveServerDraft = async () => {
    if (!text.trim()) {
      message.error('Enter some findings before saving to server');
      return;
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', bottom: 110, right: 30, zIndex: 1100 }}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          onClick={() => setOpen(true)}
          title="Quick Add Finding"
          style={{ width: 56, height: 56, borderRadius: '50%', boxShadow: '0 10px 30px rgba(79,70,229,0.12)' }}
        >
          <PlusOutlined />
        </Button>
      </div>

      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        width={760}
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><PlusOutlined /> Quick Add Finding</div>}
      >
        <div style={{ marginBottom: 12, color: '#64748b' }}>
          Paste raw findings or notes here. When you close or click "Save & Go to Cases" the text will be saved and available in the New Case form.
        </div>
        <TextArea rows={10} value={text} onChange={e => setText(e.target.value)} placeholder={`Paste lines like:\ncontact: +92300...\nemail: target@example.com\nusername: shadow_user`} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <Button onClick={handleClose} icon={<CloseOutlined />}>Close & Save Draft</Button>
          <Button type="default" onClick={handleSaveServerDraft} icon={<UploadOutlined />}>Save to Server</Button>
          <Button type="primary" onClick={handleSaveAndGo}>Save & Go to Cases</Button>
        </div>
      </Modal>
    </>
  );
};

export default QuickAddFinding;
