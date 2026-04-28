import Footer from '../../components/landing/Footer';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="w-full flex flex-col min-h-screen bg-slate-50">
            <div className="flex-grow pt-32 pb-20 max-w-4xl mx-auto px-6 w-full">
                <div className="text-center mb-12">
                   <h1 className="text-5xl font-bold font-heading text-slate-900 mb-4">Terms of <span className="text-gradient">Service</span></h1>
                   <p className="text-lg text-slate-500">Effective as of {new Date().toLocaleDateString()}</p>
                </div>
                
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] border border-slate-100 prose prose-slate max-w-none">
                    <p>Welcome to LocalDev Connect. By using our website and services, you agree to comply with and be bound by the following terms and conditions of use.</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing or using LocalDev Connect, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>

                    <h3>2. Description of Service</h3>
                    <p>LocalDev Connect provides an online marketplace platform that connects local business owners ("Clients") with university or college students ("Developers") for the purpose of contracting freelance technical and design work.</p>

                    <h3>3. User Responsibilities</h3>
                    <ul>
                        <li><strong>Truthful Information:</strong> Users must provide accurate, current, and complete information during the registration process.</li>
                        <li><strong>Account Security:</strong> Users are responsible for safeguarding the password that they use to access the service.</li>
                        <li><strong>Professional Conduct:</strong> Both Clients and Developers agree to communicate respectfully, professionally, and fairly at all times.</li>
                    </ul>

                    <h3>4. Payments and Escrow</h3>
                    <p>All project payments must go through our Smart Escrow platform to ensure protection for both parties. Circumventing our payment system to pay developers off-platform violates these terms and will result in an immediate ban. Funds held in Escrow will be released once project milestones are explicitly approved by the Client.</p>

                    <h3>5. Intellectual Property</h3>
                    <p>Upon final payment and release of Escrow funds, the intellectual property rights of the custom software code or design transfer from the Developer to the Client, unless explicitly agreed otherwise in a separate contract.</p>

                    <h3>6. Limitation of Liability</h3>
                    <p>LocalDev Connect acts solely as a matchmaking and escrow facilitation platform. We are not liable for the quality of code produced, missed deadlines, or business losses incurred by the use of freelance services contracted through this platform.</p>

                    <p className="text-sm text-slate-400 mt-8">These terms may be updated without prior notice. Continued use of the platform constitutes acceptance of updated terms.</p>
                </div>
                
                <div className="flex justify-center w-full mt-12 mb-4">
                   <Link to="/" className="px-8 py-3 bg-white border border-slate-200 text-slate-800 font-bold rounded-xl shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.12)] hover:bg-slate-50 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                      &larr; Go Back to Home
                   </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Terms;
