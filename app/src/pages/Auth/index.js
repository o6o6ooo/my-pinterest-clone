import { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export default function Auth() {
    const [activeTab, setActiveTab] = useState('signin');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] font-sans px-4 text-[#0A4A6E]" data-testid="auth-screen">
            <div className="flex space-x-4 mb-4">
                <button
                    onClick={() => setActiveTab('signin')}
                    className={`px-4 py-2 font-medium ${activeTab === 'signin' ? 'border-b-2 border-[#0A4A6E]' : 'text-gray-500'
                        }`}
                >
                    Sign In
                </button>
                <button
                    onClick={() => setActiveTab('signup')}
                    className={`px-4 py-2 font-medium ${activeTab === 'signup' ? 'border-b-2 border-[#0A4A6E]' : 'text-gray-500'
                        }`}
                >
                    Sign Up
                </button>
            </div>

            <div className="w-full max-w-xs">
                {activeTab === 'signin' ? <SignInForm /> : <SignUpForm />}
            </div>
        </div>
    );
}