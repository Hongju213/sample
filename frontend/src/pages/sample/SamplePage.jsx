import React from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  List,
  Popconfirm,
  Progress,
  Radio,
  Rate,
  Row,
  Segmented,
  Select,
  Slider,
  Space,
  Spin,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Timeline,
  Tooltip,
  Transfer,
  Tree,
  Typography,
  Upload
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  createSampleItem,
  deleteSampleItem,
  fetchCurrentUser,
  fetchSampleItems,
  updateSampleItem
} from '../../apis/sampleItemApi.js';
import { transferItems, treeData } from '../../dev/sampleData.js';
import { formatDateTime, statusColor, statusOptions } from '../../utils/format.js';
import './SamplePage.css';

export default function SamplePage() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [targetKeys, setTargetKeys] = useState(['1', '3']);

  // API가 살아 있으면 서버 데이터를, 아니면 sampleItemApi의 local mock 데이터를 사용한다.
  const loadItems = async (nextKeyword = keyword) => {
    setLoading(true);
    try {
      const page = await fetchSampleItems({ keyword: nextKeyword || undefined });
      setItems(page.content);
    } catch {
      message.error('목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems('');
  }, []);

  const columns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 80 },
      { title: '제목', dataIndex: 'title' },
      {
        title: '상태',
        dataIndex: 'status',
        width: 110,
        render: status => <Tag color={statusColor(status)}>{status}</Tag>
      },
      {
        title: '수정일',
        dataIndex: 'updatedAt',
        width: 170,
        render: formatDateTime
      },
      {
        title: '작업',
        width: 130,
        render: (_, record) => (
          <Space>
            <Tooltip title="수정">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(record);
                  form.setFieldsValue({
                    title: record.title,
                    description: record.description,
                    status: record.status
                  });
                }}
              />
            </Tooltip>
            <Popconfirm title="삭제할까요?" onConfirm={() => handleDelete(record.id)}>
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      }
    ],
    [form]
  );

  const handleSubmit = async values => {
    try {
      if (editing) {
        await updateSampleItem(editing.id, values);
        message.success('수정했습니다.');
      } else {
        await createSampleItem(values);
        message.success('등록했습니다.');
      }

      form.resetFields();
      setEditing(null);
      await loadItems();
    } catch {
      message.error('저장에 실패했습니다.');
    }
  };

  const handleDelete = async id => {
    try {
      await deleteSampleItem(id);
      message.success('삭제했습니다.');
      await loadItems();
    } catch {
      message.error('삭제에 실패했습니다.');
    }
  };

  const testAuth = async () => {
    try {
      const user = await fetchCurrentUser();
      modal.success({ title: 'API 인증 성공', content: `${user.username} 계정으로 호출했습니다.` });
    } catch {
      modal.error({ title: 'API 인증 실패', content: '상단 인증 정보를 확인하세요.' });
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>CRUD 및 Ant Design 샘플</h1>
        <p>업무 화면에서 자주 쓰는 입력, 표, 피드백 컴포넌트를 한 번에 확인합니다.</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <Card
            title={editing ? '샘플 수정' : '샘플 등록'}
            extra={
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditing(null);
                  form.resetFields();
                }}
              >
                신규
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{ status: 'TODO' }}
              onFinish={handleSubmit}
            >
              <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력하세요.' }]}>
                <Input placeholder="샘플 항목 제목" />
              </Form.Item>
              <Form.Item name="description" label="설명">
                <Input.TextArea rows={4} placeholder="설명" />
              </Form.Item>
              <Form.Item name="status" label="상태" rules={[{ required: true }]}>
                <Select options={statusOptions} />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  저장
                </Button>
                <Button onClick={testAuth}>API 인증 테스트</Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card
            title="샘플 목록"
            extra={
              <Space>
                <Input.Search
                  allowClear
                  placeholder="검색"
                  value={keyword}
                  onChange={event => setKeyword(event.target.value)}
                  onSearch={value => loadItems(value)}
                  className="sample-search"
                />
                <Button icon={<ReloadOutlined />} onClick={() => loadItems()} />
              </Space>
            }
          >
            <Table
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={items}
              pagination={{ pageSize: 5 }}
              expandable={{ expandedRowRender: record => record.description || '-' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="sample-grid">
        <Card title="기본 입력">
          <Space direction="vertical" className="sample-stack">
            <Input placeholder="Input" />
            <Input.Password placeholder="Password" />
            <InputNumber min={0} max={100} defaultValue={12} className="sample-full-width" />
            <Select defaultValue="A" options={[{ value: 'A' }, { value: 'B' }, { value: 'C' }]} />
            <DatePicker className="sample-full-width" />
            <TimePicker className="sample-full-width" />
          </Space>
        </Card>

        <Card title="선택 컨트롤">
          <Space direction="vertical" className="sample-stack">
            <Checkbox.Group options={['조회', '등록', '수정', '삭제']} defaultValue={['조회']} />
            <Radio.Group defaultValue="daily" options={[{ label: '일간', value: 'daily' }, { label: '월간', value: 'monthly' }]} />
            <Segmented options={['목록', '차트', '설정']} />
            <Switch checkedChildren="ON" unCheckedChildren="OFF" defaultChecked />
            <Slider defaultValue={42} />
            <Rate defaultValue={3} />
          </Space>
        </Card>

        <Card title="피드백">
          <Space direction="vertical" className="sample-stack">
            <Alert type="success" showIcon message="저장되었습니다." />
            <Spin spinning={loading}>
              <Typography.Text>로딩 상태는 Spin으로 감쌉니다.</Typography.Text>
            </Spin>
            <Progress percent={68} />
            <Badge count={5}>
              <Button>알림</Button>
            </Badge>
          </Space>
        </Card>

        <Card title="오버레이">
          <Space wrap>
            <Tooltip title="도움말 메시지">
              <Button>Tooltip</Button>
            </Tooltip>
            <Dropdown menu={{ items: [{ key: '1', label: '메뉴 1' }, { key: '2', label: '메뉴 2' }] }}>
              <Button icon={<SettingOutlined />}>Dropdown</Button>
            </Dropdown>
            <Button onClick={() => setDrawerOpen(true)}>Drawer</Button>
            <Button onClick={() => modal.info({ title: 'Modal', content: '업무 확인 창 샘플입니다.' })}>
              Modal
            </Button>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Space>
        </Card>

        <Card title="데이터 표시">
          <Tabs
            items={[
              {
                key: 'stat',
                label: 'Statistic',
                children: <Statistic title="처리 건수" value={1280} suffix="건" />
              },
              {
                key: 'list',
                label: 'List',
                children: (
                  <List
                    size="small"
                    dataSource={['API', 'Mapper', 'Service']}
                    renderItem={item => <List.Item>{item}</List.Item>}
                  />
                )
              }
            ]}
          />
        </Card>

        <Card title="흐름 표시">
          <Timeline
            className="sample-timeline"
            items={[
              { color: 'green', children: '요청 접수' },
              { color: 'blue', children: '처리 중' },
              { color: 'gray', children: '완료 대기' }
            ]}
          />
        </Card>

        <Card title="Tree / Transfer">
          <Tree treeData={treeData} defaultExpandAll />
          <Transfer
            dataSource={transferItems}
            targetKeys={targetKeys}
            onChange={nextKeys => setTargetKeys(nextKeys)}
            render={item => item.title}
            className="sample-transfer"
          />
        </Card>

        <Card title="업무 카드">
          <Space direction="vertical" className="sample-stack">
            <Typography.Title level={5} className="sample-card-title">
              업무 상태
            </Typography.Title>
            <Typography.Paragraph type="secondary">
              Card, Space, Typography 조합으로 간단한 업무 패널을 구성합니다.
            </Typography.Paragraph>
            <Button type="primary" icon={<ExperimentOutlined />}>
              테스트 실행
            </Button>
          </Space>
        </Card>
      </div>

      <Drawer title="Drawer 샘플" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Typography.Paragraph>
          상세 정보, 필터, 보조 작업은 오른쪽 패널에서 처리할 수 있습니다.
        </Typography.Paragraph>
      </Drawer>
    </>
  );
}
