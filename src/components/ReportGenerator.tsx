import React, { useState } from 'react';
import { Modal, Button, Select, message, Spin, Space, Tabs, Divider, Tooltip } from 'antd';
import { FileTextOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import api from '../api/axiosConfig';

interface ReportGeneratorProps {
  caseId: string;
  caseTitle: string;
  onReportGenerated?: () => void;
}

interface Report {
  id: string;
  title: string;
  content: string;
  template: 'fbi' | 'corporate';
  riskLevel: string;
  findings_count: number;
  generatedAt: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ caseId, caseTitle, onReportGenerated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [template, setTemplate] = useState<'fbi' | 'corporate'>('corporate');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const generateReport = async () => {
    if (!caseId) {
      message.error('Case ID is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/reports/generate', {
        caseId,
        template,
      });

      if (response.data.success) {
        setReport(response.data.report);
        message.success(`${template.toUpperCase()} report generated successfully!`);
        if (onReportGenerated) onReportGenerated();
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to generate report. Ensure you have findings and OpenAI API key configured.';
      message.error(errorMsg);
      console.error('Report generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!report?.id) return;
    try {
      const response = await api.get(`/reports/${report.id}/export/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${caseTitle}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Report downloaded as PDF!');
    } catch (error: any) {
      message.error('Failed to download PDF');
      console.error('PDF download error:', error);
    }
  };

  const downloadJSON = async () => {
    if (!report?.id) return;
    try {
      const response = await api.get(`/reports/${report.id}/export/json`);
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${caseTitle}-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Report downloaded as JSON!');
    } catch (error: any) {
      message.error('Failed to download JSON');
    }
  };

  const copyToClipboard = () => {
    if (!report?.content) return;
    navigator.clipboard.writeText(report.content);
    setCopiedToClipboard(true);
    message.success('Report copied to clipboard!');
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  return (
    <>
      <Tooltip title="Generate AI-powered professional report from findings">
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ marginRight: 10 }}
        >
          GENERATE REPORT
        </Button>
      </Tooltip>

      <Modal
        title={`[REPORT GENERATION ENGINE] - ${caseTitle}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setReport(null);
        }}
        footer={null}
        width={900}
        style={{ backgroundColor: '#0d1117' }}
        bodyStyle={{ backgroundColor: '#f8fafc', color: 'var(--text-main)' }}
      >
        {!report ? (
          <div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'var(--cyber-blue)', fontWeight: 'bold' }}>Select Report Template:</label>
              <Select
                value={template}
                onChange={(value) => setTemplate(value)}
                options={[
                  { label: 'Law Enforcement / FBI Style', value: 'fbi' },
                  { label: 'Corporate Intelligence Report', value: 'corporate' },
                ]}
                style={{ width: '100%', marginTop: 10 }}
              />
              <p style={{ fontSize: 12, color: '#8b949e', marginTop: 10 }}>
                • <strong>FBI Style:</strong> Formal law enforcement format with structured sections
                <br />
                • <strong>Corporate:</strong> Business intelligence format with risk assessment
              </p>
            </div>

            <Divider style={{ borderColor: 'var(--border-color)' }} />

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Button
                type="primary"
                size="large"
                onClick={generateReport}
                loading={loading}
                disabled={loading}
                style={{ minWidth: 200 }}
              >
                {loading ? 'GENERATING REPORT...' : 'GENERATE REPORT'}
              </Button>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Spin tip="Analyzing findings and generating report..." />
              </div>
            )}
          </div>
        ) : (
          <div>
            <Space style={{ marginBottom: 20 }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadPDF}
              >
                Download PDF
              </Button>
              <Button
                type="default"
                icon={<DownloadOutlined />}
                onClick={downloadJSON}
              >
                Download JSON
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                type={copiedToClipboard ? 'primary' : 'default'}
              >
                {copiedToClipboard ? 'Copied!' : 'Copy Text'}
              </Button>
            </Space>

            <div
              style={{
                backgroundColor: '#0d1117',
                borderRadius: 6,
                padding: 20,
                maxHeight: '60vh',
                overflowY: 'auto',
              }}
            >
              <Tabs
                items={[
                  {
                    key: 'rendered',
                    label: 'Formatted Report',
                    children: (
                      <div
                        style={{
                          color: '#e6edf3',
                          fontFamily: 'monospace',
                          lineHeight: 1.6,
                        }}
                      >
                        <ReactMarkdown>{report.content}</ReactMarkdown>
                      </div>
                    ),
                  },
                  {
                    key: 'raw',
                    label: 'Raw Markdown',
                    children: (
                      <pre
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: 15,
                          borderRadius: 4,
                          overflowX: 'auto',
                          color: 'var(--cyber-blue)',
                          fontSize: 12,
                        }}
                      >
                        {report.content}
                      </pre>
                    ),
                  },
                ]}
              />
            </div>

            <Divider style={{ borderColor: 'var(--border-color)' }} />

            <div style={{ color: '#8b949e', fontSize: 12 }}>
              <p>
                <strong>Template:</strong> {report.template.toUpperCase()} | <strong>Risk Level:</strong> {report.riskLevel} | <strong>Findings:</strong> {report.findings_count}
              </p>
              <p>
                <strong>Generated:</strong> {new Date(report.generatedAt).toLocaleString()}
              </p>
            </div>

            <Button
              block
              onClick={() => setReport(null)}
              style={{ marginTop: 15 }}
            >
              Generate Another Report
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ReportGenerator;
