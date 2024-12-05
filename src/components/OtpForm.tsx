import { useState } from 'react';

interface OtpFormProps {
    onSubmit: (otp: string) => Promise<void>;
}

export function OtpForm({ onSubmit }: OtpFormProps) {
    const [otp, setOtp] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(otp);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 5-digit OTP"
                maxLength={5}
                pattern="[0-9]{5}"
                required
            />
            <button type="submit">Verify OTP</button>
        </form>
    );
} 