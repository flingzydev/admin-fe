import { useState } from 'react';

interface LoginFormProps {
    onSubmit: (phone: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
    const [phone, setPhone] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(phone);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                required
            />
            <button type="submit">Send OTP</button>
        </form>
    );
} 