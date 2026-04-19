import React, { useState, useEffect, useCallback } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tabs, 
  DatePicker, 
  Button,
  Typography,
  Space,
  message,
  Radio
} from 'antd';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from 'recharts';
import { 
  DownloadOutlined, 
  ReloadOutlined, 
  RiseOutlined, 
  FallOutlined, 
  ToolOutlined, 
  TeamOutlined, 
  LineChartOutlined 
} from '@ant-design/icons';
import api from '../../api/axiosConfig';
import type { User, AnalyticsData } from '../../types/admin';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#00ff88', '#1890ff', '#f5222d', '#faad14'];

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [timeframe, setTimeframe] = useState('30d');
  
  // Data States
  const [toolUsage, setToolUsage] = useState<any[]>([]);
  const [dailyScanTrend, setDailyScanTrend] = useState<AnalyticsData[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const start = dateRange[0].format('YYYY-MM-DD');
      const end = dateRange[1].format('YYYY-MM-DD');

      const [usageRes, trendRes, topUsersRes, peakRes] = await Promise.all([
        api.get(`/admin/analytics/tools-usage?startDate=${start}&endDate=${end}`),
        api.get(`/admin/analytics/trends?startDate=${start}&endDate=${end}&timeframe=${timeframe}`),
        api.get('/admin/analytics/top-users'),
        api.get(`/admin/analytics/peak-activity?startDate=${start}&endDate=${end}`)
      ]);

      // Process Tool Usage
      const usageData = Object.entries(usageRes.data.data || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));
      setToolUsage(usageData);

      // Process Trends
      setDailyScanTrend(trendRes.data.data || []);
      
      // Calculate growth if enough data
      if (trendRes.data.data.length >= 2) {
        const first = trendRes.data.data[0].scans;
        const last = trendRes.data.data[trendRes.data.data.length - 1].scans;
        const growth = first === 0 ? 100 : Math.round(((last - first) / first) * 100);
        setGrowthMetrics({ growth, direction: growth >= 0 ? 'up' : 'down' });
      }

      setTopUsers(topUsersRes.data.data || []);
      setPeakHours(peakRes.data.data || []);

    } catch (error) {
      message.error('Failed to reconstruct analytics intelligence.');
    } finally {
      setLoading(false);
    }
  }, [dateRange, timeframe]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 60s refresh
    return () => clearInterval(interval);
  }, [fetchData]);

  const exportData = () => {
    const data = dailyScanTrend.map(row => `${row.date},${row.scans},${row.users}`).join('\n');
    const blob = new Blob([`Date,Scans,UniqueUsers\n${data}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `shadowscan_analytics_${dayjs().format('YYYYMMDD')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    message.success('Intelligence report exported successfully.');
  };

  const toolStats = toolUsage.length > 0 ? {
    mostUsed: toolUsage.reduce((a, b) => a.value > b.value ? a : b),
    leastUsed: toolUsage.reduce((a, b) => a.value < b.value ? a : b)
  } : null;

  return (
    <div style={{ paddingBottom: 40 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
        <Col>
          <Title level={2} style={{ color: '#00ff88', margin: 0 }}>SYSTEM ANALYTICS & INTELLIGENCE</Title>
        </Col>
        <Col>
          <Space size="middle">
            <RangePicker 
              value={dateRange} 
              onChange={(val) => val && setDateRange([val[0]!, val[1]!])}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading} />
            <Button type="primary" icon={<DownloadOutlined />} onClick={exportData}>EXPORT DATA</Button>
          </Space>
        </Col>
      </Row>

      <Tabs 
        defaultActiveKey="1" 
        className="admin-tabs"
        items={[
          {
            key: '1',
            label: <span><ToolOutlined /> TOOL PERFORMANCE</span>,
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                  <Card title="DISTRIBUTION" className="admin-chart-card">
                    <div style={{ height: 350 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={toolUsage}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${( (percent || 0) * 100).toFixed(0)}%`}
                          >
                            {toolUsage.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #30363d' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} lg={16}>
                  <Card title="DAILY VOLUME" className="admin-chart-card">
                    <div style={{ height: 350 }}>
                      <ResponsiveContainer>
                        <BarChart data={dailyScanTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                          <XAxis dataKey="date" stroke="#8b949e" fontSize={12} />
                          <YAxis stroke="#8b949e" fontSize={12} />
                          <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #30363d' }} />
                          <Bar dataKey="scans" fill="#00ff88" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card className="admin-stat-card">
                    <Statistic 
                      title="MOST UTILIZED TOOL" 
                      value={toolStats?.mostUsed.name} 
                      prefix={<RiseOutlined style={{ color: '#00ff88' }} />}
                      valueStyle={{ color: '#00ff88' }}
                    />
                    <Text style={{ fontSize: '12px', color: '#8b949e' }}>Total executions: {toolStats?.mostUsed.value}</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card className="admin-stat-card">
                    <Statistic 
                      title="LEAST UTILIZED TOOL" 
                      value={toolStats?.leastUsed.name} 
                      prefix={<FallOutlined style={{ color: '#ff4d4f' }} />}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                    <Text style={{ fontSize: '12px', color: '#8b949e' }}>Focus needed for tool optimization</Text>
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: '2',
            label: <span><TeamOutlined /> OPERATIVE ACTIVITY</span>,
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card title="CONCURRENT ACTIVE OPERATIVES" className="admin-chart-card">
                    <div style={{ height: 350 }}>
                      <ResponsiveContainer>
                        <AreaChart data={dailyScanTrend}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                          <XAxis dataKey="date" stroke="#8b949e" fontSize={12} />
                          <YAxis stroke="#8b949e" fontSize={12} />
                          <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #30363d' }} />
                          <Area type="monotone" dataKey="users" stroke="#1890ff" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="PEAK HOURS (UTC)" className="admin-chart-card">
                    <div style={{ height: 350 }}>
                      <ResponsiveContainer>
                        <BarChart data={peakHours}>
                          <XAxis dataKey="hour" stroke="#8b949e" fontSize={10} label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                          <YAxis hide />
                          <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #30363d' }} />
                          <Bar dataKey="count" fill="#faad14" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title="TOP 10 OPERATIVE LEADERBOARD" className="admin-table-card">
                    <Table 
                      dataSource={topUsers} 
                      rowKey="_id" 
                      pagination={false}
                      className="admin-compact-table"
                      columns={[
                        { title: 'OPERATIVE', dataIndex: 'username', key: 'name', render: (t) => <span style={{ color: '#00ff88' }}>{t}</span> },
                        { title: 'EMAIL', dataIndex: 'email', key: 'email' },
                        { title: 'TOTAL SCANS', dataIndex: 'totalScans', key: 'scans', sorter: (a, b) => a.totalScans - b.totalScans },
                        { title: 'LAST ACTIVE', dataIndex: 'lastLogin', key: 'last', render: (v) => v ? dayjs(v).fromNow() : 'N/A' }
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: '3',
            label: <span><LineChartOutlined /> STRATEGIC TRENDS</span>,
            children: (
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <Radio.Group value={timeframe} onChange={(e) => setTimeframe(e.target.value)} buttonStyle="solid">
                      <Radio.Button value="7d">7 DAYS</Radio.Button>
                      <Radio.Button value="30d">30 DAYS</Radio.Button>
                      <Radio.Button value="90d">90 DAYS</Radio.Button>
                    </Radio.Group>
                  </div>
                  <Card title="SCANS VS UNIQUE OPERATIVES" className="admin-chart-card">
                    <div style={{ height: 400 }}>
                      <ResponsiveContainer>
                        <LineChart data={dailyScanTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                          <XAxis dataKey="date" stroke="#8b949e" fontSize={12} />
                          <YAxis yAxisId="left" stroke="#00ff88" label={{ value: 'Scans', angle: -90, position: 'insideLeft', fill: '#00ff88' }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#1890ff" label={{ value: 'Users', angle: 90, position: 'insideRight', fill: '#1890ff' }} />
                          <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #30363d' }} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="scans" stroke="#00ff88" strokeWidth={3} name="Total Scans" />
                          <Line yAxisId="right" type="monotone" dataKey="users" stroke="#1890ff" strokeWidth={3} name="Unique Operatives" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card className="admin-stat-card">
                    <Statistic 
                      title="PERIOD GROWTH RATE" 
                      value={growthMetrics?.growth} 
                      suffix="%" 
                      valueStyle={{ color: growthMetrics?.direction === 'up' ? '#00ff88' : '#f50' }}
                      prefix={growthMetrics?.direction === 'up' ? <RiseOutlined /> : <FallOutlined />}
                    />
                    <Text style={{ color: '#8b949e' }}>Trajectory over the selected period</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card className="admin-stat-card">
                    <Statistic 
                      title="DAILY AVERAGE SCANS" 
                      value={dailyScanTrend.length > 0 ? Math.round(dailyScanTrend.reduce((a, b) => a + b.scans, 0) / dailyScanTrend.length) : 0} 
                      valueStyle={{ color: '#1890ff' }}
                    />
                    <Text style={{ color: '#8b949e' }}>System load benchmark</Text>
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />
    </div>
  );
};

export default Analytics;
