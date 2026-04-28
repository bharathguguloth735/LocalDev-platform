import Footer from '../../components/landing/Footer';
import FeaturedDevelopers from '../../components/landing/FeaturedDevelopers';

const Explore = () => {
    return (
        <div className="w-full flex flex-col min-h-screen bg-slate-50">
            <div className="pt-32 pb-6 text-center max-w-4xl mx-auto px-6">
                <h1 className="text-5xl font-black font-heading text-slate-900 mb-6">Discover Top <span className="text-gradient">Talent</span></h1>
                <p className="text-xl text-slate-500">Browse through the highest-rated student developers on our platform, ready to tackle your toughest technical challenges today.</p>
            </div>
            
            <div className="-mt-12 scale-100 p-0">
                <FeaturedDevelopers hideHeader={true} />
            </div>
            
            <div className="flex-grow"></div>
            <Footer />
        </div>
    );
};

export default Explore;
