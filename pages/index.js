import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-[#121212] text-white min-h-screen">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center py-24 text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Real Estate Risk Analysis, Reinvented</h1>
          <p className="text-xl text-gray-400 max-w-2xl mb-8">Analyze, simulate, and visualize long-term multifamily performance with ease.</p>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-[#1e1e1e]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">🔍 Deal Explorer</h3>
              <p className="text-gray-400">Compare, tweak, and save scenarios to evaluate different acquisition strategies. Make on-the-fly adjustments to inputs such as interest rate, loan term, and property appreciation.</p>
            </div>
            <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">📊 Simulation Engine</h3>
              <p className="text-gray-400">Run 30-year projections with real inflation, rent, and vacancy data to stress-test any deal.</p>
            </div>
            <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">💡 Risk Dashboard</h3>
              <p className="text-gray-400">Visualize IRR, Drawdown, DSCR trends, and more — with intuitive graphs and performance breakdowns.</p>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">About This Project</h2>
            <p className="text-gray-400 text-lg">
              [FILLER TEXT] This is where you can describe your motivation behind the tool, the inspiration, and the vision going forward.
              Explain how this solves a pain point for real estate investors and why you decided to build it.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 bg-[#1e1e1e] text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to stress test your next deal?</h2>
          <Link
            href="/deals"
            className="bg-[#475569] hover:bg-[#334155] text-white px-6 py-3 rounded-md text-lg transition"
          >
            Try the Simulator
          </Link>
        </section>
      </main>
    </>
  );
}