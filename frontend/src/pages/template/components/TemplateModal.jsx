import React, { useEffect, useMemo } from 'react';
import { App, Col, Divider, Form, Input, Modal, Row, Select, Typography } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../constants/queryKeys.js';
import { MODE } from '../constants/config.jsx';
import { useTemplateCreate, useTemplateUpdate } from '../api/templateApi.js';

const { Title } = Typography;

export function TemplateModal({ open, mode, data, onClose }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { mutate: createMutate, isPending: isCreating } = useTemplateCreate();
  const { mutate: updateMutate, isPending: isUpdating } = useTemplateUpdate();
  const isViewMode = mode === MODE.VIEW;

  const title = useMemo(() => {
    if (mode === MODE.CREATE) return '템플릿 등록';
    if (mode === MODE.EDIT) return '템플릿 수정';
    return '템플릿 상세';
  }, [mode]);

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      title: data?.title ?? '',
      description: data?.description ?? '',
      status: data?.status ?? 'TODO'
    });
  }, [data, form, open]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSave = () => {
    form
      .validateFields()
      .then(() => {
        Modal.confirm({
          title: '저장 확인',
          content: '입력한 내용을 저장하시겠습니까?',
          okText: '저장',
          cancelText: '취소',
          onOk: handleSaveOk
        });
      })
      .catch(() => undefined);
  };

  const handleSaveOk = () => {
    const params = form.getFieldsValue();
    const onSuccess = () => {
      message.success('저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: [queryKeys.templateList] });
      handleClose();
    };
    const onError = () => {
      message.error('저장에 실패했습니다.');
    };

    if (mode === MODE.CREATE) {
      createMutate(params, { onSuccess, onError });
      return;
    }

    updateMutate({ id: data.id, payload: params }, { onSuccess, onError });
  };

  return (
    <Modal
      title={title}
      open={open}
      width={720}
      destroyOnClose
      maskClosable={false}
      className="template-modal"
      cancelText="닫기"
      okText="저장"
      onCancel={handleClose}
      onOk={handleSave}
      okButtonProps={isViewMode ? { className: 'is-hidden' } : { size: 'middle' }}
      cancelButtonProps={{ size: 'middle' }}
      confirmLoading={isCreating || isUpdating}
    >
      <div className="marginsTight">
        <Title level={3}>기본 정보</Title>
        <Divider />
        <Form form={form} layout="vertical" disabled={isViewMode} preserve={false}>
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Form.Item
                label="제목 (NAME)"
                name="title"
                rules={[{ required: true, message: '제목을 입력하세요.' }]}
              >
                <Input maxLength={200} placeholder="제목 입력" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="상태 (useYn)"
                name="status"
                rules={[{ required: true, message: '상태를 선택하세요.' }]}
              >
                <Select>
                  <Select.Option value="DONE">사용(Y)</Select.Option>
                  <Select.Option value="TODO">미사용(N)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Title level={3}>상세 정보</Title>
          <Divider />
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Form.Item label="설명 (DESCRIPTION)" name="description">
                <Input.TextArea rows={5} maxLength={1000} placeholder="설명 입력" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}
