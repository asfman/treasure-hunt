//import dynamic from 'next/dynamic';
//const Wallet = dynamic(() => import('./wallet'), {
  //ssr: false,
//})
import { Header } from "@/components/Header";
import { Content } from "@/components/Content";

export default function Home() {
  return (
      <main>
        <Header />
        <Content />
        <div className="flex mb-4 justify-center text-white">© Copyright 2024 • Treasure Hunt. any suggestions, please&nbsp;<a className="underline underline-offset-4 decoration-blue-600" href="mailto:asfman@gmail.com">send an email</a>.</div>
      </main>
  );
}
