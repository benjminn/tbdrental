//src/app/auth/login/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import LoginForm from '../../../components/Auth/LoginForm';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { login, signup } = useAuth();

  const handleSubmit = async (data) => {
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const result = await login(data.username, data.password);
        if (result.success) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setError(result.error);
        }
      } else {
        const result = await signup(data);
        if (result.success) {
          setSuccess('Account created successfully! Please login.');
          setIsLogin(true);
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Sign in to your account' : 'Get started with your portfolio'}
            </p>
          </div>

          <LoginForm 
            isLogin={isLogin}
            onSubmit={handleSubmit}
            error={error}
            success={success}
            toggleMode={toggleMode}
          />
        </div>

        <div className="px-8 py-4 bg-gray-50 text-center">
          <p className="text-gray-600 text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}