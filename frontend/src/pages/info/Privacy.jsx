import Footer from '../../components/landing/Footer';
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <div className="w-full flex flex-col min-h-screen bg-slate-50">
            <div className="flex-grow pt-32 pb-20 max-w-4xl mx-auto px-6 w-full">
                <div className="text-center mb-12">
                   <h1 className="text-5xl font-bold font-heading text-slate-900 mb-4">Privacy <span className="text-gradient">Policy</span></h1>
                   <p className="text-lg text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] border border-slate-100 prose prose-slate max-w-none">
                    <p>At LocalDev Connect, we take your privacy seriously. This Privacy Policy outlines the types of personal information that is received and collected by our platform and how it is used.</p>
                    
                    <h3>1. Information We Collect</h3>
                    <p>We only collect the information necessary to provide our matchmaking and project management services. This includes:</p>
                    <ul>
                        <li><strong>Account Information:</strong> Name, email address, password, and university affiliation.</li>
                        <li><strong>Profile Data:</strong> Resumes, portfolios, skills, bios, and project listings.</li>
                        <li><strong>Financial Data:</strong> Basic transaction history (processed safely through external secure gateways).</li>
                    </ul>

                    <h3>2. How We Use Your Information</h3>
                    <p>The core use of your data is to facilitate the connection between clients and students. We use your data to:</p>
                    <ul>
                        <li>Match projects with the appropriate student skills.</li>
                        <li>Facilitate secure messaging and communication.</li>
                        <li>Process escrow payments safely.</li>
                        <li>Improve platform performance and AI matching algorithms.</li>
                    </ul>

                    <h3>3. Data Security</h3>
                    <p>Your data is heavily encrypted. Passwords are hashed using bcrypt. Payment information is never stored on our raw databases and is handled exclusively by PCI-compliant partners like Razorpay and Stripe.</p>

                    <h3>4. Third-Party Disclosure</h3>
                    <p>We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.</p>

                    <h3>Contacting Us</h3>
                    <p>If there are any questions regarding this privacy policy, you may contact us using the information on our Contact page.</p>
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

export default Privacy;
