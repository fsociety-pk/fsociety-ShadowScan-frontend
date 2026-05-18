import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  Tooltip, 
  Popconfirm, 
  message, 
  Typography, 
  Row, 
  Col, 
  Divider,
  Badge,
  Descriptions,
  Skeleton
} from 'antd';
import { 
  SearchOutlined, 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  StopOutlined, 
  CheckCircleOutlined, 
  EyeOutlined,
  KeyOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { adminService } from '../../services/adminService';
import api from '../../api/axiosConfig';
import type { User } from '../../types/admin';

const { Title, Text } = Typography;

// Form Validation Schemas
const userSchema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Too short'),
  email: yup.string().email('Invalid email'),
  password: yup.string().when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Password is required').min(6, 'Too short'),
    otherwise: (schema) => schema.notRequired()
  }),
  role: yup.string().oneOf(['user', 'admin']).required('Role is required'),
});

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({ page: 1, limit: 10, search: '', role: '', status: '' });
  
  // Modals state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isSudoVisible, setIsSudoVisible] = useState(false);
  const [sudoPassword, setSudoPassword] = useState('');
  const [sudoLoading, setSudoLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<any>) | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(userSchema),
    context: { isEdit: !!editingUser }
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers(params.page, params.limit, {
        role: params.role,
        isActive: params.status !== '' ? params.status === 'active' : undefined,
        search: params.search
      });
      setUsers(response.data);
      if (response.pagination) {
        setTotal(response.pagination.total);
      }
    } catch (_error) {
      message.error('Failed to retrieve operative data.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onSearch = (value: string) => {
    setParams(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleSudoExecution = async (action: () => Promise<any>) => {
    const token = sessionStorage.getItem('sudoToken');
    if (token) {
      try {
        await action();
        return;
      } catch (error: any) {
        if (error.response?.status !== 403) {
          throw error;
        }
        // If it's a 403 even with token, token might be expired
        sessionStorage.removeItem('sudoToken');
      }
    }
    
    // Prompt for SUDO
    setPendingAction(() => action);
    setIsSudoVisible(true);
  };

  const onSudoConfirm = async () => {
    setSudoLoading(true);
    try {
      const response = await api.post('/auth/sudo', { password: sudoPassword });
      const { sudoToken } = response.data;
      sessionStorage.setItem('sudoToken', sudoToken);
      setIsSudoVisible(false);
      setSudoPassword('');
      
      if (pendingAction) {
        await pendingAction();
        setPendingAction(null);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Sudo elevation failed.';
      message.error(`Sudo elevation failed: ${errorMsg}`);
      console.error('[Admin] Sudo Error:', error);
    } finally {
      setSudoLoading(false);
    }
  };

  const handleStatusToggle = async (user: User) => {
    const action = async () => {
      const token = sessionStorage.getItem('sudoToken') || undefined;
      if (user.isActive) {
        await adminService.blockUser(user._id, 'Admin manual deactivation', token);
      } else {
        await adminService.unblockUser(user._id, token);
      }
      message.success(`Operative ${user.username} state modified.`);
      fetchUsers();
    };
    
    handleSudoExecution(action);
  };

  const handleDelete = async (id: string) => {
    const action = async () => {
      const token = sessionStorage.getItem('sudoToken') || undefined;
      await adminService.deleteUser(id, token);
      message.success('Operative permanently removed from database.');
      fetchUsers();
    };

    handleSudoExecution(action);
  };

  const handleResetPassword = async (id: string) => {
    const action = async () => {
      const token = sessionStorage.getItem('sudoToken') || undefined;
      const response = await adminService.resetPassword(id, token);
      Modal.success({
        title: 'PASSWORD RESET INITIALIZED',
        content: `New secure credentials: ${response.data.temporaryPassword}`,
        onOk: () => {}
      });
    };

    handleSudoExecution(action);
  };

  const showDetailModal = async (id: string) => {
    setIsDetailVisible(true);
    setDetailLoading(true);
    try {
      const response = await adminService.getUserDetails(id);
      setSelectedUserDetail(response.data);
    } catch (_error) {
      message.error('Failed to retrieve deep dive data.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleNotesUpdate = async (notes: string) => {
    try {
      await adminService.updateUser(selectedUserDetail.user._id, { notes });
      message.success('Intelligence notes updated.');
    } catch (_error) {
      message.error('Notes sync failed.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser._id, data);
        message.success('Operative profile updated.');
      } else {
        await adminService.createUser(data);
        message.success('New operative provisioned into system.');
      }
      setIsModalVisible(false);
      reset();
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Data submission failed.');
    }
  };

  const columns = [
    {
      title: 'OPERATIVE',
      dataIndex: 'username',
      key: 'username',
      sorter: true,
      render: (text: string, record: User) => (
        <Space>
          <Badge status={record.isActive ? 'processing' : 'default'} color={record.isActive ? 'var(--cyber-blue)' : 'var(--text-muted)'} />
          <span style={{ color: 'var(--cyber-blue)', fontWeight: 'bold' }}>{text}</span>
        </Space>
      )
    },
    {
      title: 'ROLE',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>{role.toUpperCase()}</Tag>
      )
    },
    {
      title: 'SCANS',
      dataIndex: 'totalScans',
      key: 'totalScans',
      sorter: true,
      render: (val: number) => <Text style={{ color: 'var(--text-muted)' }}>{val}</Text>
    },
    {
      title: 'RISK',
      dataIndex: 'riskScore',
      key: 'riskScore',
      sorter: true,
      render: (score: number) => (
        <Tag color={score > 70 ? 'red' : score > 30 ? 'orange' : 'green'}>
          {score}%
        </Tag>
      )
    },
    {
      title: 'LAST ACCESS',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (val: string) => val ? new Date(val).toLocaleString() : 'NEVER'
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Tooltip title="Deep Dive">
            <Button icon={<EyeOutlined />} size="small" ghost onClick={() => showDetailModal(record._id)} />
          </Tooltip>
          <Tooltip title="Modify">
            <Button icon={<EditOutlined />} size="small" ghost onClick={() => {
              setEditingUser(record);
              setIsModalVisible(true);
              setValue('username', record.username);
              setValue('email', record.email || '');
              setValue('role', record.role);
            }} />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
            <Button 
                icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />} 
                danger={record.isActive} 
                size="small" 
                ghost 
                onClick={() => handleStatusToggle(record)}
            />
          </Tooltip>
          <Popconfirm title="Reset credentials?" onConfirm={() => handleResetPassword(record._id)}>
            <Tooltip title="Reset Credentials">
              <Button icon={<KeyOutlined />} size="small" ghost />
            </Tooltip>
          </Popconfirm>
          <Popconfirm title="Terminate operative data?" onConfirm={() => handleDelete(record._id)} okText="TERMINATE" okType="danger">
            <Tooltip title="Delete">
              <Button icon={<DeleteOutlined />} size="small" danger ghost />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="user-management-page">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ color: 'var(--cyber-blue)', margin: 0 }}>OPERATIVE MANAGEMENT</Title>
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder="Search by ID or Alias..."
              onSearch={onSearch}
              allowClear
              size="large"
              style={{ width: 300 }}
              enterButton={<SearchOutlined />}
            />
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              size="large"
              onClick={() => {
                setEditingUser(null);
                reset();
                setIsModalVisible(true);
              }}
            >
              PROVISION OPERATIVE
            </Button>
            <Button icon={<ReloadOutlined />} size="large" onClick={fetchUsers} />
          </Space>
        </Col>
      </Row>

      <Card className="admin-table-card">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: params.page,
            pageSize: params.limit,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onShowSizeChange: (_curr, size) => setParams(p => ({ ...p, limit: size, page: 1 })),
            onChange: (page) => setParams(p => ({ ...p, page }))
          }}
          onChange={() => {
            // Sorting/Filtering logic would go here to update query params
          }}
        />
      </Card>

      {/* Creation/Edit Modal */}
      <Modal
        title={editingUser ? '[ MODIFY OPERATIVE ]' : '[ PROVISION NEW OPERATIVE ]'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          reset();
        }}
        footer={null}
        className="admin-modal"
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Ident Alias (Username)" validateStatus={errors.username ? 'error' : ''} help={errors.username?.message}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => <Input {...field} size="large" />}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Electronic Mail (Optional)" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <Input {...field} size="large" />}
                />
              </Form.Item>
            </Col>
            {!editingUser && (
              <Col span={24}>
                <Form.Item label="Initial Access Key" validateStatus={errors.password ? 'error' : ''} help={errors.password?.message}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => <Input.Password {...field} size="large" />}
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={24}>
              <Form.Item label="Security Clearance (Role)" validateStatus={errors.role ? 'error' : ''} help={errors.role?.message}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} size="large">
                      <Select.Option value="user">USER</Select.Option>
                      <Select.Option value="admin">ADMIN</Select.Option>
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setIsModalVisible(false)}>ABORT</Button>
            <Button type="primary" htmlType="submit" size="large">
              {editingUser ? 'SYNC CHANGES' : 'EXECUTE PROVISIONING'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="[ OPERATIVE DEEP DIVE ]"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={800}
        className="admin-modal"
      >
        {detailLoading ? <Skeleton active /> : selectedUserDetail && (
          <div>
            <Descriptions title="Profile Data" bordered column={2} className="admin-descriptions">
              <Descriptions.Item label="Ident">{selectedUserDetail.user.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedUserDetail.user.email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Cleared">{selectedUserDetail.user.role.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge status={selectedUserDetail.user.isActive ? 'processing' : 'default'} text={selectedUserDetail.user.isActive ? 'ACTIVE' : 'DEACTIVATED'} />
              </Descriptions.Item>
              <Descriptions.Item label="Risk Score">{selectedUserDetail.user.riskScore}%</Descriptions.Item>
              <Descriptions.Item label="Registered">{new Date(selectedUserDetail.user.createdAt).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>

            <Divider orientation={"left" as any} orientationMargin={0}>INTELLIGENCE NOTES</Divider>
            <Input.TextArea 
              defaultValue={selectedUserDetail.user.notes} 
              rows={4} 
              onBlur={(e) => handleNotesUpdate(e.target.value)}
              placeholder="Admin notes on operative risk and status..."
            />

            <Divider orientation={"left" as any} orientationMargin={0}>RECENT SYSTEM INTERACTIONS</Divider>
            <Table 
              size="small"
              dataSource={selectedUserDetail.activity}
              rowKey="_id"
              pagination={false}
              columns={[
                { title: 'TOOL', dataIndex: 'toolName', key: 'toolName' },
                { title: 'ACTION', dataIndex: 'action', key: 'action' },
                { title: 'TIME', dataIndex: 'timestamp', key: 'timestamp', render: (ts) => new Date(ts).toLocaleString() },
                { title: 'STATUS', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'success' ? 'var(--cyber-blue)' : '#f50'}>{s.toUpperCase()}</Tag> }
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Sudo Elevation Modal */}
      <Modal
        title="[ SECURITY ELEVATION REQUIRED ]"
        open={isSudoVisible}
        onCancel={() => {
          setIsSudoVisible(false);
          setSudoPassword('');
          setPendingAction(null);
        }}
        onOk={onSudoConfirm}
        confirmLoading={sudoLoading}
        okText="CONFIRM IDENTITY"
        cancelText="ABORT"
        className="admin-modal"
      >
        <div style={{ marginBottom: 16 }}>
          <Text color="secondary">
            This operation is classified as <strong>high-risk</strong>. 
            Confirm your administrator credentials to proceed with security-level changes.
          </Text>
        </div>
        <Input.Password
          placeholder="Admin Access Key..."
          value={sudoPassword}
          onChange={(e) => setSudoPassword(e.target.value)}
          onPressEnter={onSudoConfirm}
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default UserManagement;
