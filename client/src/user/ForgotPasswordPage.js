import { Form, Input, Button, message } from 'antd';
import { postPasswordResetRequestApi } from '../api';
import { useApi } from '../useApi';

export function ForgotPasswordPage() {
  const [state, requestReset] = useApi(postPasswordResetRequestApi, () => {}, false);

  const onFinish = ({ mail }) => {
    requestReset(null, { mail }, () => {
      message.success('Link sent — check your inbox!');
    });
  };

  return (
    <Form onFinish={onFinish}>
      {/* email input */}
      <Form.Item name="mail"><Input /></Form.Item>
      <Button htmlType="submit" loading={state.loading}>Send reset link</Button>
    </Form>
  );
}
