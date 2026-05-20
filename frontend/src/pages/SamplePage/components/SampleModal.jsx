import React, { useEffect, useMemo } from 'react';
import { App, Col, Divider, Form, Input, Modal, Row, Select, Typography } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../constants/queryKeys.js';
import { statusOptions } from '../../../utils/format.js';
import { MODE } from '../constants/index.js';
import { useSampleCreate, useSampleUpdate } from '../api/index.js';

const { Title } = Typography;

export function SampleModal({ open, mode, data, onClose }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { mutate: createMutate, isPending: isCreating } = useSampleCreate();
  const { mutate: updateMutate, isPending: isUpdating } = useSampleUpdate();
  const isViewMode = mode === MODE.VIEW;

  const title = useMemo(() => {
    if (mode === MODE.CREATE) {
      return '샘플 등록';
    }

    if (mode === MODE.EDIT) {
      return '샘플 수정';
    }

    return '샘플 상세';
  }, [mode]);

  useEffect(() => {
    if (!open) {
      return;
    }

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
          onOk: formOk
        });
      })
      .catch(() => undefined);
  };

  const formOk = () => {
    const params = form.getFieldsValue();
    const onSuccess = () => {
      message.success('저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: [queryKeys.sampleList] });
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
      className="sample-modal"
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
                label="제목"
                name="title"
                rules={[{ required: true, message: '제목을 입력하세요.' }]}
              >
                <Input maxLength={200} placeholder="샘플 제목" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="상태"
                name="status"
                rules={[{ required: true, message: '상태를 선택하세요.' }]}
              >
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Title level={3}>상세 정보</Title>
          <Divider />
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Form.Item label="설명" name="description">
                <Input.TextArea rows={5} maxLength={1000} placeholder="설명" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}
