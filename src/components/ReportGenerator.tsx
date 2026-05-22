import React, { useState } from 'react';
import { Modal, Button, Select, message, Spin, Space, Divider, Tooltip } from 'antd';
import { FileTextOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import api from '../api/axiosConfig';
import CaseReportView from './CaseReportView';
import type { CaseReport } from './CaseReportView';

interface ReportGeneratorProps {
  caseId: string;
  caseTitle: string;
  onReportGenerated?: () => void;
}

type Report = CaseReport;

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
      const response = await api.post('/reports/generate', { caseId, template });
      if (response.data.success) {
        setReport(response.data.report);
        message.success(`${template.toUpperCase()} report generated successfully!`);
        if (onReportGenerated) onReportGenerated();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } } };
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to generate report. Ensure you have findings and an API key configured.';
      message.error(errorMsg);
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
      window.URL.revokeObjectURL(url);
      message.success('Report downloaded as PDF!');
    } catch {
      message.error('Failed to download PDF');
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
      <Tooltip title="Generate a structured case dossier from the saved findings">
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
        width="min(1280px, 96vw)"
        style={{ backgroundColor: '#0d1117' }}
        styles={{ body: { backgroundColor: '#f8fafc', color: 'var(--text-main)', maxHeight: '86vh', overflowY: 'auto' } }}
      >
        {!report ? (
          <div>
            {/* Template selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'var(--cyber-blue)', fontWeight: 'bold' }}>Select Dossier Template:</label>
              <Select
                value={template}
                onChange={value => setTemplate(value)}
                options={[
                  { label: 'Law Enforcement Style', value: 'fbi' },
                  { label: 'Corporate Intelligence Report', value: 'corporate' },
                ]}
                style={{ width: '100%', marginTop: 10 }}
              />
              <p style={{ fontSize: 12, color: '#8b949e', marginTop: 10 }}>
                • <strong>Law Enforcement:</strong> Formal investigation format with structured sections
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
            {/* Action buttons */}
            <Space style={{ marginBottom: 20 }}>
              <Button type="primary" icon={<DownloadOutlined />} onClick={downloadPDF}>
                Download PDF
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                type={copiedToClipboard ? 'primary' : 'default'}
              >
                {copiedToClipboard ? 'Copied!' : 'Copy Text'}
              </Button>
            </Space>

            <CaseReportView
              report={report}
              caseTitle={caseTitle}
              onDownloadPdf={downloadPDF}
              onCopyText={copyToClipboard}
              copiedToClipboard={copiedToClipboard}
            />

            <Divider style={{ borderColor: 'var(--border-color)' }} />

            <Button block onClick={() => setReport(null)} style={{ marginTop: 15 }}>
              Generate Another Report
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ReportGenerator;
