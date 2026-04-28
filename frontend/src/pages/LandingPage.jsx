import Hero from '../components/landing/Hero';
import Services from '../components/landing/Services';
import HowItWorks from '../components/landing/HowItWorks';
import FeaturedDevelopers from '../components/landing/FeaturedDevelopers';
import Testimonials from '../components/landing/Testimonials';
import LivePulse from '../components/landing/LivePulse';
import AiMarketEstimator from '../components/landing/AiMarketEstimator';
import Footer from '../components/landing/Footer';

import useUserStore from '../store/useUserStore';

const LandingPage = () => {
  const { isAuthenticated } = useUserStore();

  return (
    <div className="w-full flex flex-col">
      <Hero />
      <LivePulse />
      <Services />
      {!isAuthenticated && <AiMarketEstimator />}
      <HowItWorks />
      <FeaturedDevelopers limit={3} />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default LandingPage;
