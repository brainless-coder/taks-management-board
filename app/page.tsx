"use client";

import dynamic from 'next/dynamic';
import Header from './components/Header';

// Use dynamic import with SSR disabled for components that use browser APIs like localStorage
const BoardWithNoSSR = dynamic(() => import('./components/Board'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <BoardWithNoSSR />
      </main>
    </div>
  );
}
