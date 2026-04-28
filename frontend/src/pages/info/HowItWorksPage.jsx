import Footer from '../../components/landing/Footer';
import HowItWorks from '../../components/landing/HowItWorks';
import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
    return (
        <div className="w-full flex flex-col min-h-screen bg-slate-50">
            <div className="pt-32 bg-slate-50 text-center max-w-3xl mx-auto px-6">
                <h1 className="text-5xl font-black font-heading text-slate-900 mb-6">The <span className="text-gradient">Process</span></h1>
                <p className="text-xl text-slate-500">Discover exactly how we turn your business ideas into deployed, revenue-generating software safely and securely.</p>
            </div>
            
            <HowItWorks />
            
            <div className="flex justify-center w-full mt-12 mb-4">
               <Link to="/" className="px-8 py-3 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-white hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  &larr; Go Back to Home
               </Link>
            </div>
            
            <div className="flex-grow"></div>
            <Footer />
        </div>
    );
};

export default HowItWorksPage;
