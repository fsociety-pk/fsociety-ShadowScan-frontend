import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Button, message, Spin, Empty, Row, Col, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import ReportGenerator from '../../components/ReportGenerator';
import CaseReportView from '../../components/CaseReportView';
import type { CaseReport } from '../../components/CaseReportView';

const { Title } = Typography;

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
  targetProfile?: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
    location?: string;
    socialMedia?: string;
    additionalNotes?: string;
  };
}

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investigation, setInvestigation] = useState<InvestigationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<CaseReport[]>([]);
  
  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const fetchReports = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/reports/case/${id}`);
      if (response.data.success && response.data.reports) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (investigation?._id) {
      fetchReports();
    }
  }, [investigation?._id]);

  const fetchCaseData = async () => {
    try {
      const response = await api.get(`/cases/${id}`);
      setInvestigation(response.data);
    } catch (_error) {
      message.error('Unauthorized or Case not found');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (prio: string) => {
    if (prio === 'Low') return 'default';
    if (prio === 'Medium') return 'processing';
    if (prio === 'High') return 'warning';
    return 'error';
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
  if (!investigation) return null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/cases')} 
        style={{ marginBottom: 20, color: 'var(--text-muted)' }}
      >
        Back to Investigations
      </Button>

      <Row gutter={24} align="middle" style={{ marginBottom: 30 }}>
        <Col flex="auto">
          <Title level={2} style={{ margin: 0 }}>{investigation.title}</Title>
          <Space style={{ marginTop: 10 }}>
            <Tag color="blue">{investigation.category}</Tag>
            <Tag color={getPriorityColor(investigation.priority)}>{investigation.priority.toUpperCase()}</Tag>
            <Tag color={investigation.status === 'Active' ? 'success' : 'default'}>{investigation.status.toUpperCase()}</Tag>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/cases/${investigation._id}/edit`)}
              size="large"
            >
              Edit Case
            </Button>
            <ReportGenerator 
              caseId={investigation._id} 
              caseTitle={investigation.title}
              onReportGenerated={() => {
                fetchReports();
              }}
            />
          </Space>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24 }} styles={{ body: { padding: 0 } }}>
        {reports.length > 0 ? (
          <div style={{ padding: 16 }}>
            <CaseReportView
              report={reports[0]}
              caseTitle={investigation.title}
              onDownloadPdf={() => {
                api.get(`/reports/${reports[0].id}/export/pdf`, { responseType: 'blob' }).then((response) => {
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `report-${investigation.title}-${new Date().toISOString().split('T')[0]}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                  message.success('Report downloaded as PDF!');
                }).catch(() => message.error('Failed to download PDF'));
              }}
              onCopyText={() => {
                navigator.clipboard.writeText(reports[0].content);
                message.success('Report copied to clipboard!');
              }}
            />
          </div>
        ) : (
          <div style={{ padding: 24 }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No AI Intelligence Report available for this case yet."
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default CaseDetail;
