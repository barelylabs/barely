"use client";

import Footer from "../components/footer";
import BuildYourJourney from "./BuildYourJourney";
// import Header from './Header';
import Hero from "./Hero";
import MadeForMarketing from "./MadeForMarketing";
import SupportedApps from "./SupportedApps";

export default function LinkPage() {
  return (
    <div className="flex w-full flex-col place-items-center">
      {/* <Header />  */}
      <Hero />
      <SupportedApps />
      <BuildYourJourney />
      <MadeForMarketing />

      <Footer />
    </div>
  );
}
