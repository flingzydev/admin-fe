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
            // Call your API endpoint to send OTP
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
            // Call your API endpoint to verify OTP
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
        <div>
            <h1>Login</h1>
            {!showOtp ? (
                <LoginForm onSubmit={handleSendOtp} />
            ) : (
                <OtpForm onSubmit={handleVerifyOtp} />
            )}
        </div>
    );
} 