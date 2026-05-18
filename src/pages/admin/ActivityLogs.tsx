import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Table, 
  Card, 
  Form, 
  Select, 
  DatePicker, 
  Checkbox, 
  Input, 
  Button, 
  Row, 
  Col, 
  Tag, 
  Badge, 
  Space, 
  Typography, 
  message, 
  Alert,
  Collapse
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  SyncOutlined, 
  DownloadOutlined, 
  ExclamationCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import api from '../../api/axiosConfig';
import type { AdminLog } from '../../types/admin';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ACTIONS = [
  'email_lookup', 'username_scan', 'phone_lookup', 'metadata_extraction', 
  'user_created', 'user_deleted', 'user_blocked', 'login_attempt', 'password_reset_request'
];

const TOOLS = ['EmailIntelligence', 'UsernameTracker', 'PhoneForensics', 'MetadataExtractor', 'AdminPanel'];

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Tracking new logs for highlighting
  const prevLogIds = useRef<Set<string>>(new Set());
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set());

  const [form] = Form.useForm();
  const [params, setParams] = useState({
    page: 1,
    limit: 100,
    search: '',
    actions: [] as string[],
    tools: [] as string[],
    status: undefined as string | undefined,
    dateRange: null as any
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', { params: { limit: 1000 } });
      setUsers(res.data.data.map((u: any) => ({ label: u.username, value: u._id })));
    } catch (e) {
      console.error('Failed to fetch operatives list');
    }
  };

  const fetchAnomalies = async () => {
    try {
      const res = await api.get('/admin/logs/anomalies');
      setAnomalies(res.data.data.anomalies || []);
    } catch (e) {
      console.error('Failed to fetch anomaly data');
    }
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { search, actions, tools, status, dateRange, page, limit } = params;
      const queryParams: any = { 
        page, 
        limit, 
        search, 
        status,
        action: actions.length ? actions : undefined,
        toolName: tools.length ? tools : undefined 
      };

      if (dateRange) {
        queryParams.dateFrom = dateRange[0].toISOString();
        queryParams.dateTo = dateRange[1].toISOString();
      }

      const res = await api.get('/admin/logs/filter', { params: queryParams });
      const newLogs = res.data.data;
      
      // Calculate which logs are new since last fetch (if not first load)
      if (prevLogIds.current.size > 0) {
        const ids = new Set(newLogs.map((l: any) => l._id));
        const actuallyNew = new Set(Array.from(ids).filter(id => !prevLogIds.current.has(id as string)));
        setNewLogIds(actuallyNew as Set<string>);
      }
      
      prevLogIds.current = new Set(newLogs.map((l: any) => l._id));
      setLogs(newLogs);
      setTotal(res.data.pagination.total);
      setSecondsAgo(0);
    } catch (_error) {
      message.error('Failed to synchronize with central intelligence node.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
    fetchAnomalies();
    fetchLogs();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSecondsAgo(s => s + 1), 1000);
    const refreshTimer = setInterval(() => {
        fetchLogs();
        fetchAnomalies();
    }, 30000); // 30s refresh

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, [fetchLogs]);

  const onFilterChange = (_: any, allValues: any) => {
    setParams(prev => ({
      ...prev,
      ...allValues,
      page: 1
    }));
  };

  const handleExport = async () => {
    try {
      const { search, actions, tools, status, dateRange } = params;
      const queryParams: any = { search, status, action: actions, toolName: tools };
      if (dateRange) {
        queryParams.dateFrom = dateRange[0].toISOString();
        queryParams.dateTo = dateRange[1].toISOString();
      }
      
      const response = await api.get('/admin/logs/export', { 
        params: queryParams,
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `intel_logs_${dayjs().format('YYYY-MM-DD_HHmm')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      message.error('Data extraction failed.');
    }
  };

  const applyAnomalyFilter = (userId: string) => {
    form.setFieldsValue({ userId });
    setParams(prev => ({ ...prev, userId, page: 1 }));
    fetchLogs();
  };

  const columns = [
    {
      title: 'TIMESTAMP',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 200,
      render: (t: string) => <Text style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{dayjs(t).format('YYYY-MM-DD HH:mm:ss')}</Text>,
      sorter: (a: any, b: any) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
    },
    {
      title: 'OPERATIVE',
      dataIndex: 'userId',
      key: 'user',
      render: (user: any) => (
        <Space>
          <UserOutlined style={{ color: 'var(--cyber-blue)' }} />
          <span style={{ fontWeight: 'bold' }}>{user?.username || 'SYSTEM'}</span>
        </Space>
      )
    },
    {
      title: 'ACTION',
      dataIndex: 'action',
      key: 'action',
      render: (a: string) => <Tag color="#ffffff" style={{ border: '1px solid var(--border-color)', color: 'var(--cyber-blue)' }}>{a.toUpperCase()}</Tag>
    },
    {
      title: 'TOOL',
      dataIndex: 'toolName',
      key: 'tool',
      render: (t: string) => <Text style={{ color: '#1890ff' }}>{t}</Text>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Badge 
          status={s === 'success' ? 'success' : 'error'} 
          text={<span style={{ color: s === 'success' ? 'var(--cyber-blue)' : '#f50' }}>{s.toUpperCase()}</span>} 
        />
      )
    },
    {
      title: 'ORIGIN IP',
      dataIndex: 'ipAddress',
      key: 'ip',
      render: (ip: string) => (
        <Space>
          <GlobalOutlined style={{ fontSize: 12, color: 'var(--text-muted)' }} />
          <Text copyable style={{ color: 'var(--text-muted)' }}>{ip}</Text>
        </Space>
      )
    }
  ];

  return (
    <div className="activity-logs-page">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ color: 'var(--cyber-blue)', margin: 0 }}>CENTRAL INTELLIGENCE FEED</Title>
        </Col>
        <Col>
          <Space>
            <Text style={{ color: 'var(--text-muted)' }}>
              <ClockCircleOutlined /> Last Sync: {secondsAgo}s ago
            </Text>
            <Button icon={<SyncOutlined spin={loading} />} onClick={fetchLogs}>REFRESH</Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>EXTRACT LOGS</Button>
          </Space>
        </Col>
      </Row>

      {anomalies.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Title level={4} style={{ color: '#f50' }}><ExclamationCircleOutlined /> THREAT DETECTION ALERTS</Title>
            {anomalies.map((a, i) => (
              <Alert
                key={i}
                message={<strong>{a.type.toUpperCase()} DETECTED</strong>}
                description={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                        Operative [<strong>{a.username}</strong>] {a.details}
                    </span>
                    <Button size="small" danger onClick={() => applyAnomalyFilter(a.userId)}>ISOLATE TRAFFIC</Button>
                  </div>
                }
                type={a.severity === 'high' ? 'error' : 'warning'}
                showIcon
                style={{ marginBottom: 8 }}
              />
            ))}
          </Col>
        </Row>
      )}

      <Card className="admin-filter-card" style={{ marginBottom: 24 }}>
        <Form 
          form={form} 
          layout="vertical" 
          onValuesChange={onFilterChange}
          initialValues={params}
        >
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item name="search" label="Search Operative or IP">
                <Input prefix={<SearchOutlined />} placeholder="Username, IP address..." allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="dateRange" label="Selection Window">
                <RangePicker style={{ width: '100%' }} showTime />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="status" label="Protocol Status">
                <Select placeholder="All Statuses" allowClear>
                  <Select.Option value="success">SUCCESS (PROT_01)</Select.Option>
                  <Select.Option value="failed">FAILURE (ERR_403)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="userId" label="Target Operative">
                <Select placeholder="All Operatives" allowClear options={users} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Collapse ghost defaultActiveKey={[]}>
                <Collapse.Panel header={<span style={{ color: 'var(--cyber-blue)' }}><FilterOutlined /> ADVANCED SIGNAL FILTERS</span>} key="1">
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Form.Item name="actions" label="Intercepted Actions">
                            <Checkbox.Group options={ACTIONS} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="tools" label="Operational Tools">
                            <Checkbox.Group options={TOOLS} />
                        </Form.Item>
                    </Col>
                  </Row>
                </Collapse.Panel>
              </Collapse>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card className="admin-table-card">
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: params.page,
            pageSize: params.limit,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['50', '100', '200'],
            onShowSizeChange: (_curr, size) => setParams(p => ({ ...p, limit: size, page: 1 })),
            onChange: (page) => setParams(p => ({ ...p, page }))
          }}
          rowClassName={(record) => newLogIds.has(record._id) ? 'new-log-row animate-flash' : ''}
        />
      </Card>

      <style>{`
        .new-log-row {
            background-color: rgba(0, 255, 136, 0.05) !important;
        }
        .animate-flash {
            animation: flashHighlight 3s ease-out;
        }
        @keyframes flashHighlight {
            0% { background-color: rgba(0, 255, 136, 0.2); }
            100% { background-color: rgba(0, 255, 136, 0.05); }
        }
      `}</style>
    </div>
  );
};

export default ActivityLogs;
