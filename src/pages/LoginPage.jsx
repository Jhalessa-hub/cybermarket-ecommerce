import LoginForm from '../components/auth/LoginForm.jsx';
import AuthLayout from '../components/layout/AuthLayout.jsx';
export default function LoginPage() {
  return <AuthLayout title="Bienvenido de nuevo" description="Ingresa con tu email y contraseña."><LoginForm /></AuthLayout>;
}
