import { ComparisonTable } from '~/components/marketing/comparison-table';
import { FAQSection } from '~/components/marketing/faq-section';
import { FinalCTA } from '~/components/marketing/final-cta';
import { Footer } from '~/components/marketing/footer';
import { Hero } from '~/components/marketing/hero';
import { HowItWorks } from '~/components/marketing/how-it-works';
import { Navbar } from '~/components/marketing/navbar';
import { PricingSection } from '~/components/marketing/pricing-section';
import { ProblemStatement } from '~/components/marketing/problem-statement';
import { SocialProof } from '~/components/marketing/social-proof';
import { SolutionFeatures } from '~/components/marketing/solution-features';

export default function InvoiceLandingPage() {
	return (
		<div className='min-h-screen'>
			<Navbar />

			<main>
				<Hero />
				<ProblemStatement />
				<SolutionFeatures />
				<HowItWorks />
				<PricingSection />
				<ComparisonTable />
				<SocialProof />
				<FAQSection />
				<FinalCTA />
			</main>

			<Footer />
		</div>
	);
}
