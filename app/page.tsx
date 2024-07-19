//import dynamic from 'next/dynamic';
//const Wallet = dynamic(() => import('./wallet'), {
  //ssr: false,
//})
import { Header } from "@/components/Header";
import { Content } from "@/components/Content";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
      <main>
        <Header />
        <Content />
        <Footer />
      </main>
  );
}
