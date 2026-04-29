import Footer from '../../components/landing/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
    return (
        <div className="w-full flex flex-col min-h-screen bg-slate-50">
            <div className="flex-grow pt-32 pb-20 max-w-5xl mx-auto px-6 w-full">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold font-heading text-slate-900 mb-4">Contact <span className="text-gradient">Us</span></h1>
                    <p className="text-lg text-slate-500">We'd love to hear from you. Reach out to our team!</p>
                </div>

                <div className="grid md:grid-cols-5 gap-8">
                    {/* Contact Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] border border-slate-100 flex items-start gap-4 hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.12)] transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
                                <p className="text-sm text-slate-500">hello@localdevconnect.com</p>
                                <p className="text-sm text-slate-500">support@localdevconnect.com</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] border border-slate-100 flex items-start gap-4 hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.12)] transition-shadow">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">Call Us</h3>
                                <p className="text-sm text-slate-500">040-23456789</p>
                                <p className="text-sm text-slate-500">Mon-Fri, 9am - 6pm IST</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] border border-slate-100 flex items-start gap-4 hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.12)] transition-shadow">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">Headquarters</h3>
                                <p className="text-sm text-slate-500">123 Tech Campus Blvd</p>
                                <p className="text-sm text-slate-500">Suite 400, Innovation City</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-3 bg-white rounded-[2rem] p-8 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] border border-slate-100">
                        <h3 className="text-2xl font-bold text-slate-900 font-heading mb-6">Send a Message</h3>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }}>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">First Name</label>
                                    <input type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none" placeholder="John" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Last Name</label>
                                    <input type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Email Address</label>
                                <input type="email" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none" placeholder="john@company.com" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Message</label>
                                <textarea required rows="4" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none resize-none" placeholder="How can we help you?"></textarea>
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                Send Message <Send className="w-4 h-4" />
                            </button>
                        </form>
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

export default Contact;
