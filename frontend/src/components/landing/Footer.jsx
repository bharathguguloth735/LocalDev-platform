import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6 bg-white/10 p-2 rounded-xl inline-flex backdrop-blur-sm">
            <img src="/logo.png" alt="LocalDev Connect" className="h-12 w-auto object-contain drop-shadow" />
          </div>
          <p className="text-slate-400 max-w-sm mb-6">
            Connecting local businesses with talented student developers for affordable, high-quality digital solutions.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 font-heading">Platform</h4>
          <ul className="space-y-3">
            <li><Link to="/explore" className="hover:text-white transition-colors">Find Developers</Link></li>
            <li><Link to="/post-project" className="hover:text-white transition-colors">Post a Project</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 font-heading">Company</h4>
          <ul className="space-y-3">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} LocalDev Connect. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="text-slate-500 hover:text-white transition-colors">
             <span className="sr-only">Twitter</span>
             <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-500 hover:text-white transition-colors">
             <span className="sr-only">LinkedIn</span>
             <Linkedin className="w-5 h-5" />
          </a>
          <a href="#" className="text-slate-500 hover:text-white transition-colors">
             <span className="sr-only">Instagram</span>
             <Instagram className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
