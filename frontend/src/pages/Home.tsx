import Hero from '@/components/sections/Hero';
import Milk from '@/components/sections/Milk';
import About from '@/components/sections/About';
import Leaderboard from '@/components/sections/Leaderboard';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="min-h-screen scroll-smooth bg-white font-sans antialiased">
      {/* Navigation est maintenant dans App.tsx */}
      <Hero />
      <Milk />
      <About />
      <Leaderboard/>
      <Footer />
    </main>
  );
}