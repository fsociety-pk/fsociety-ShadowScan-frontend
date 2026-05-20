import React, { useState } from 'react';
import { Card, Row, Col, Tag, Tooltip, Table } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ShareAltOutlined,
  PieChartOutlined,
  AimOutlined,
  LinkOutlined,
  BulbOutlined,
} from '@ant-design/icons';

interface Entity {
  type: string;
  value: string;
  platform?: string;
}

interface Relationship {
  entity1: string;
  entity2: string;
  type: string;
  strength: number;
  evidence: string[];
}

interface EntityRelationshipViewerProps {
  entities: Entity[];
  relationships: Relationship[];
}

const EntityRelationshipViewer: React.FC<EntityRelationshipViewerProps> = ({ entities, relationships }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return <MailOutlined />;
      case 'phone':
        return <PhoneOutlined />;
      case 'name':
        return <UserOutlined />;
      case 'location':
        return <EnvironmentOutlined />;
      case 'username':
        return <UserOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return '#ff7a45';
      case 'phone':
        return '#13c2c2';
      case 'name':
        return '#faad14';
      case 'location':
        return '#eb2f96';
      case 'username':
        return 'var(--cyber-blue)';
      default:
        return '#1890ff';
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength > 0.8) return '#ff4d4f';
    if (strength > 0.5) return '#faad14';
    return '#52c41a';
  };

  const connectedNodes =
    selectedNode === null
      ? []
      : relationships
          .filter((r) => r.entity1 === selectedNode || r.entity2 === selectedNode)
          .map((r) => (r.entity1 === selectedNode ? r.entity2 : r.entity1));

  return (
    <div style={{ width: '100%' }}>
      <Card
        title={<span style={{ fontWeight: 600 }}><ShareAltOutlined style={{ marginRight: 8 }} /> Entity Relationship Network</span>}
        style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 212, 255, 0.05) 100%)',
        }}
      >
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            {/* Entity Nodes */}
            <div
              style={{
                padding: '20px',
                background: 'rgba(11, 15, 25, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                minHeight: '300px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignContent: 'flex-start',
              }}
            >
              {entities.map((entity, idx) => {
                const isSelected = selectedNode === `${entity.type}-${entity.value}`;
                const isConnected = connectedNodes.includes(`${entity.type === 'email' ? 'email' : entity.type}-${entity.value}`);
                const nodeKey = `${entity.type}-${entity.value}`;

                return (
                  <Tooltip
                    key={idx}
                    title={
                      <div>
                        <p>
                          <strong>{entity.type}:</strong> {entity.value}
                        </p>
                        {entity.platform && <p>Platform: {entity.platform}</p>}
                      </div>
                    }
                  >
                    <div
                      onClick={() => setSelectedNode(isSelected ? null : nodeKey)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: isSelected
                          ? `${getEntityColor(entity.type)}40`
                          : isConnected
                            ? 'rgba(14, 165, 233, 0.15)'
                            : 'rgba(0, 255, 136, 0.05)',
                        border: `2px solid ${isSelected ? getEntityColor(entity.type) : isConnected ? 'var(--cyber-blue)' : 'rgba(14, 165, 233, 0.2)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: isSelected ? `0 0 12px ${getEntityColor(entity.type)}60` : 'none',
                      }}
                    >
                      <span style={{ color: getEntityColor(entity.type), marginRight: '8px' }}>
                        {getEntityIcon(entity.type)}
                      </span>
                      <span style={{ color: '#ddd', fontSize: '12px' }}>
                        {entity.value.length > 20 ? entity.value.substring(0, 20) + '...' : entity.value}
                      </span>
                    </div>
                  </Tooltip>
                );
              })}
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
              <small style={{ color: '#888' }}><BulbOutlined style={{ marginRight: 4 }} /> Click on entities to highlight connections</small>
            </div>
          </Col>

          <Col xs={24} lg={10}>
            {/* Statistics */}
            <Card style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--cyber-blue)', marginBottom: '12px' }}><PieChartOutlined style={{ marginRight: 8 }} /> Network Statistics</h4>
                <p>
                  <strong>Total Entities:</strong> <Tag color="cyan">{entities.length}</Tag>
                </p>
                <p>
                  <strong>Total Relationships:</strong> <Tag color="magenta">{relationships.length}</Tag>
                </p>
                <p>
                  <strong>Connected Nodes:</strong> <Tag color="green">{connectedNodes.length}</Tag>
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--cyber-blue)', marginBottom: '12px' }}><AimOutlined style={{ marginRight: 8 }} /> Entity Types</h4>
                {[...new Set(entities.map((e) => e.type))].map((type) => {
                  const count = entities.filter((e) => e.type === type).length;
                  return (
                    <div key={type} style={{ marginBottom: '8px' }}>
                      <span style={{ marginRight: '8px' }}>{getEntityIcon(type)}</span>
                      <Tag color="blue">
                        {type}: {count}
                      </Tag>
                    </div>
                  );
                })}
              </div>

              <div>
                <h4 style={{ color: 'var(--cyber-blue)', marginBottom: '12px' }}><LinkOutlined style={{ marginRight: 8 }} /> Relationship Strength</h4>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ marginRight: '8px', color: '#ff4d4f' }}>●</span>
                  <span style={{ color: '#ddd', fontSize: '12px' }}>Strong (&gt; 0.8)</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ marginRight: '8px', color: '#faad14' }}>●</span>
                  <span style={{ color: '#ddd', fontSize: '12px' }}>Medium (0.5 - 0.8)</span>
                </div>
                <div>
                  <span style={{ marginRight: '8px', color: '#52c41a' }}>●</span>
                  <span style={{ color: '#ddd', fontSize: '12px' }}>Weak (&lt; 0.5)</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Relationships Detail View */}
        {selectedNode && (
          <Card style={{ marginTop: '16px', background: 'rgba(0, 255, 136, 0.05)' }}>
            <h4 style={{ color: 'var(--cyber-blue)' }}>
              Relationships for: <Tag color="cyan">{selectedNode}</Tag>
            </h4>
            <Table
              dataSource={relationships.filter(
                (r) => r.entity1 === selectedNode || r.entity2 === selectedNode
              )}
              columns={[
                {
                  title: 'Connected Entity',
                  dataIndex: 'entity1',
                  key: 'entity1',
                  render: (entity1, record) => (
                    <Tag color="cyan">{entity1 === selectedNode ? record.entity2 : entity1}</Tag>
                  ),
                },
                {
                  title: 'Relationship Type',
                  dataIndex: 'type',
                  key: 'type',
                  render: (type) => <Tag color="magenta">{type}</Tag>,
                },
                {
                  title: 'Strength',
                  dataIndex: 'strength',
                  key: 'strength',
                  render: (strength) => (
                    <div
                      style={{
                        display: 'inline-block',
                        width: '100px',
                        height: '20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${strength * 100}%`,
                          height: '100%',
                          backgroundColor: getStrengthColor(strength),
                        }}
                      />
                    </div>
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        )}
      </Card>
    </div>
  );
};

export default EntityRelationshipViewer;
