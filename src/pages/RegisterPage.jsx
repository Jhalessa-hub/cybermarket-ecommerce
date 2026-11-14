import RegisterForm from '../components/auth/RegisterForm.jsx';
import AuthLayout from '../components/layout/AuthLayout.jsx';
export default function RegisterPage() {
  return <AuthLayout title="Crea tu cuenta" description="Solo necesitamos tres datos para empezar."><RegisterForm /></AuthLayout>;
}
