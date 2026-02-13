import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import FeatureSection from './components/FeatureSection';
import FeaturesGrid from './components/FeaturesGrid';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero />
        
        <TrustedBy />
        
        <FeatureSection
          pill="Seamless collaboration"
          title="Powering teamwork to simplify workflows"
          description="Say goodbye to version chaos and embrace a smoother workflow designed to help your team achieve more in less time."
          image="/assets/images/feature-collab.png"
          imagePosition="right"
        />
        
        <FeatureSection
          pill="Meaningful calendar"
          title="Dynamic planner that keeps you ahead"
          description="Stay one step ahead with a calendar that grows with your schedule. Adapt quickly to changes, manage priorities effectively."
          image="/assets/images/feature-calendar.png"
          imagePosition="left"
          bgColor="bg-white"
        />
        
        <FeatureSection
          pill="Insightful analytics"
          title="Analytics that power smarter decisions"
          description="Our cutting-edge analytics deliver detailed trends, patterns, and actionable intelligence to help you make informed decisions."
          image="/assets/images/feature-analytics.png"
          imagePosition="right"
        />
        
        <FeaturesGrid />
        
        <Testimonials />
        
        <FAQ />
      </main>
      
      <Footer />
    </div>
  );
}
