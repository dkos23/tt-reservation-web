import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { useParams } from 'react-router-dom';
import { postPasswordResetApi } from '../api';
import { useApi } from '../useApi';
import styles from './ResetPasswordPage.module.css';

export function ResetPasswordPage() {
  const [search] = useSearchParams();
  // const token = search.get('token');
  const { token } = useParams();
  const [state, resetPassword] = useApi(postPasswordResetApi, () => {}, false);
  const navigate = useNavigate();

  const onFinish = ({ password }) => {
    resetPassword(null, { token, password }, () => {
      message.success('Password reset! Please login.');
      navigate('/login');
    });
  };

  return (
    <div className={styles.wrapper}>
        <Form onFinish={onFinish}>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Bitte neues Passwort eingeben' }]}
            hasFeedback
          >
            <Input.Password placeholder="Neues Passwort" />
          </Form.Item>

          <Form.Item
            name="passwordConfirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Bitte Passwort bestätigen' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwörter stimmen nicht überein'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Passwort bestätigen" />
          </Form.Item>

          <Button
            htmlType="submit"
            type="primary"
            className={styles.resetButton}
            loading={state.loading}>
              Reset password
            </Button>
        </Form>
    </div>
  );
}
