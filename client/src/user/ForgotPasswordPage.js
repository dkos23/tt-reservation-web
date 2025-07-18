import { Form, Input, Button, message } from 'antd';
import { postPasswordResetRequestApi } from '../api';
import { useApi } from '../useApi';
import { Link } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.css';
import { StatusText } from '../admin/StatusText';

export function ForgotPasswordPage() {
  const [state, requestReset] = useApi(postPasswordResetRequestApi, () => {}, false);

  const onFinish = ({ mail }) => {
    requestReset(null, { mail }, () => {
      message.success('Link sent — check your inbox!');
    });
  };

  return (
    <div className={styles.wrapper}>
        <Form onFinish={onFinish}>
            <Form.Item name="mail" rules={[{ required: true, message: 'Bitte E-Mail eingeben' }]}>
                <Input placeholder="E-Mail" />
            </Form.Item>
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    className={styles.resetButton}
                    disabled={state.loading}
                >
                    <StatusText
                        loading={state.loading}
                        text={state.loading ? 'Anmeldung...' : 'Reset-Link senden'}
                    />
                </Button>
            </Form.Item>
        </Form>
        <div className={styles.backToLogin}>
            <Link to="/login">Zurück zum Login</Link>
        </div>
    </div>
  );
}
