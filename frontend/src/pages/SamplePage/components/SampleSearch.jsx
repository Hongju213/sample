import React, { useEffect } from 'react';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Form, Input, Row, Select } from 'antd';
import { statusOptions } from '../../../utils/format.js';

export function SampleSearch({ onSearch, onReset, refreshKey }) {
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
          <Col xs={24} md={12} xl={8}>
            <Form.Item label="검색어" name="keyword">
              <Input allowClear placeholder="제목 / 설명" onPressEnter={handleSearch} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} xl={8}>
            <Form.Item label="상태" name="status">
              <Select allowClear placeholder="전체" options={statusOptions} />
            </Form.Item>
          </Col>
        </Row>
        <div className="actions">
          <Button type="default" icon={<ReloadOutlined />} onClick={handleReset}>
            초기화
          </Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            조회
          </Button>
        </div>
      </Flex>
    </Form>
  );
}
