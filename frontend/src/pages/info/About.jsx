import Footer from '../../components/landing/Footer';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="w-full flex flex-col min-h-screen bg-slate-50">
            <div className="flex-grow pt-32 pb-20 max-w-4xl mx-auto px-6 w-full">
                <div className="text-center mb-12">
                   <h1 className="text-5xl font-bold font-heading text-slate-900 mb-4">About <span className="text-gradient">Us</span></h1>
                   <p className="text-lg text-slate-500">Bridging the gap between local ambition and student talent.</p>
                </div>
                
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="space-y-8 text-slate-600 leading-relaxed">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 font-heading mb-3">Our Mission</h3>
                            <p>LocalDev Connect was founded with a powerful dual mission: to empower local businesses to thrive in the digital age with affordable, high-quality technical solutions, while simultaneously providing active university students with invaluable real-world project experience that jumpstarts their careers.</p>
                        </div>
                        
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 font-heading mb-3">Why We Do It</h3>
                            <p>Small businesses often cannot afford agency prices for standard web development or mobile applications. Meanwhile, computer science and design students struggle to find real clients to build their professional portfolios before graduation. We created LocalDev Connect to solve both problems through a mutually beneficial ecosystem.</p>
                        </div>

                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <h3 className="text-xl font-bold text-primary font-heading mb-2">Built for the Community</h3>
                            <p>We believe in the power of keeping business local. When you hire a student through our platform, you aren't just getting an incredible digital product—you are actively investing in the next generation of technologists.</p>
                        </div>
                    </div>
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

export default About;
