import Header from '@/components/header';
import { Navbar } from './components/NavBar';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Navbar />
        <Header />
        <div className="items-center text-center">
          <h1 className="text-4xl font-bold">This is a landing page</h1>
        </div>
      </div>
    </main>
  );
}
