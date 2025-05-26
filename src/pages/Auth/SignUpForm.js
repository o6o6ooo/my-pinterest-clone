import { useState } from 'react';
import EyeIcon from '../../components/EyeIcon';
import EyeSlashIcon from '../../components/EyeSlashIcon';

export default function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // 👈 両方に使う！

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        console.log('Email:', email);
        console.log('Password:', password);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6 px-6 py-8 rounded-lg bg-transparent">
            {/* Email */}
            <div className="relative w-full">
                <label htmlFor="email" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                    required
                    style={{ minHeight: '48px' }}
                />
            </div>

            {/* Password */}
            <div className="relative w-full">
                <label htmlFor="password" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                    Password
                </label>
                <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                    required
                    style={{ minHeight: '48px' }}
                />
            </div>

            {/* Confirm Password */}
            <div className="relative w-full">
                <label htmlFor="confirmPassword" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                    Confirm Password
                </label>
                <input
                    type={showPassword ? 'text' : 'password'} // 👈 連動！
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pr-10 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                    required
                    style={{ minHeight: '48px' }}
                />
                {/* 👇 ここだけに目アイコンを配置 */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#0A4A6E] hover:text-[#08324E]"
                    aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#0A4A6E] text-white font-medium hover:bg-[#08324E] transition-colors"
            >
                Sign Up
            </button>
        </form>
    );
}