import React, { useEffect } from 'react';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Form, Input, Row, Select } from 'antd';

export function TemplateSearch({ onSearch, onReset, refreshKey }) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    onReset();
  }, [form, onReset, refreshKey]);

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const handleSearch = () => {
    onSearch(form.getFieldsValue());
  };

  return (
    <Form form={form} className="searchFilter">
      <Flex align="middle" gap={12} className="searchFilter__inner">
        <Row gutter={[16, 8]} className="filterList">
          <Col xs={24} md={8} xl={6}>
            <Form.Item label="ID" name="id">
              <Input allowClear placeholder="ID 입력" onPressEnter={handleSearch} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8} xl={6}>
            <Form.Item label="NAME" name="name">
              <Input allowClear placeholder="이름 입력" onPressEnter={handleSearch} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8} xl={6}>
            <Form.Item label="useYn" name="useYn">
              <Select allowClear placeholder="전체">
                <Select.Option value="Y">사용(Y)</Select.Option>
                <Select.Option value="N">미사용(N)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <div className="actions">
          <Button type="default" icon={<ReloadOutlined />} onClick={handleReset}>
            초기화
          </Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            검색
          </Button>
        </div>
      </Flex>
    </Form>
  );
}
