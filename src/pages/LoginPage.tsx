import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { OtpForm } from '../components/OtpForm';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
    const [showOtp, setShowOtp] = useState(false);
    const [tempPhone, setTempPhone] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSendOtp = async (phone: string) => {
        try {
            await fetch('/api/send-otp', {
                method: 'POST',
                body: JSON.stringify({ phone })
            });
            setTempPhone(phone);
            setShowOtp(true);
        } catch (error) {
            console.error('Failed to send OTP:', error);
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ phone: tempPhone, otp })
            });

            if (response.ok) {
                login(tempPhone);
                navigate('/home');
            }
        } catch (error) {
            console.error('Failed to verify OTP:', error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {showOtp ? 'Enter OTP' : 'Login'}
                    </h1>
                    <p className="text-gray-600">
                        {showOtp
                            ? 'Please enter the verification code sent to your phone'
                            : 'Enter your phone number to get started'
                        }
                    </p>
                </div>

                {!showOtp ? (
                    <LoginForm onSubmit={handleSendOtp} />
                ) : (
                    <OtpForm onSubmit={handleVerifyOtp} />
                )}
            </div>
        </div>
    );
} 