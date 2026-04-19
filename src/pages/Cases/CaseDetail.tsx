import React, { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Tag, Button, Input, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderOpenOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface InvestigationCase {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  clues: string[];
  toolsSuggested: string[];
  notes: string;
}

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investigation, setInvestigation] = useState<InvestigationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const response = await api.get(`/cases/${id}`);
      setInvestigation(response.data);
      setNotes(response.data.notes || '');
    } catch (error) {
      message.error('Unauthorized or Case not found');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.put(`/cases/${id}`, { notes });
      message.success('Intelligence notes saved.');
    } catch (error) {
      message.error('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
  if (!investigation) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={2} style={{ color: '#00ff88', marginBottom: 20 }}>
        <FolderOpenOutlined /> [ {investigation.title} ]
      </Title>
      
      <Card style={{ background: '#0d1117', border: '1px solid #30363d', marginBottom: 20 }}>
        <Descriptions column={2} bordered size="small" style={{ marginBottom: 20 }}>
          <Descriptions.Item label="Category"><Tag color="blue">{investigation.category}</Tag></Descriptions.Item>
          <Descriptions.Item label="Priority"><Tag color="error">{investigation.priority.toUpperCase()}</Tag></Descriptions.Item>
          <Descriptions.Item label="Status"><Tag color="cyan">{investigation.status.toUpperCase()}</Tag></Descriptions.Item>
          <Descriptions.Item label="Tools">{investigation.toolsSuggested.join(', ') || 'None'}</Descriptions.Item>
        </Descriptions>

        <Title level={4} style={{ color: '#e6edf3' }}>Case Briefing</Title>
        <Paragraph style={{ padding: 15, background: '#010409', borderLeft: '3px solid #00ff88', color: '#e6edf3', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {investigation.description}
        </Paragraph>

        {investigation.clues && investigation.clues.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <Title level={5} style={{ color: '#00ff88' }}>Known Clues:</Title>
            <ul style={{ color: '#8b949e', paddingLeft: 20 }}>
              {investigation.clues.map((clue, idx) => (
                <li key={idx} style={{ marginBottom: 5 }}>{clue}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card style={{ background: '#0d1117', border: '1px solid #30363d' }}>
        <Title level={4} style={{ color: '#00ff88', marginTop: 0 }}>Investigation Notes (Private)</Title>
        <TextArea 
          rows={12} 
          value={notes} 
          onChange={e => setNotes(e.target.value)}
          placeholder="Record your findings, timeline, and hypothesis here..."
          style={{ background: '#010409', borderColor: '#30363d', color: '#e6edf3', fontFamily: 'monospace' }}
        />
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={saveNotes} 
          loading={savingNotes}
          style={{ marginTop: 15 }}
        >
          SAVE INTELLIGENCE
        </Button>
      </Card>
    </div>
  );
};

export default CaseDetail;
