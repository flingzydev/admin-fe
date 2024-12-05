import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { OtpForm } from '../components/OtpForm';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../constants';

export function LoginPage() {
    const [showOtp, setShowOtp] = useState(false);
    const [tempPhone, setTempPhone] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');

    const handleSendOtp = async (phone: string) => {
        try {
            const body = { "phone": `+1${phone}` };
            const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                setTempPhone(phone);
                setShowOtp(true);
            }
        } catch (error) {
            console.error('Failed to send OTP:', error);
            setError('Invalid phone number');
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        try {
            const body = { "phone": `+1${tempPhone}`, "code": otp };
            const response = await fetch(`${API_BASE_URL}/auth/check-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                console.log("accessToken", data.access_token);
                login(data.access_token);
                navigate('/home');
            } else {
                setError('Invalid OTP');
            }
        } catch (error) {
            console.error('Failed to verify OTP:', error);
            setError('Invalid OTP');
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
                {error && <p className="text-red-500 text-center">{error}</p>}
            </div>
        </div>
    );
} 