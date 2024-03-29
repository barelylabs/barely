import Link from 'next/link';

const PrivacyPage = () => {
	return (
		<div className='block space-y-10 px-10 py-20'>
			<h1 className='text-extrabold text-5xl'>Privacy Policy & Terms of Use</h1>
			<p>
				We respect the privacy of our users and are committed to protecting it. This
				privacy policy explains how we collect, use, and share information when you use
				our service.
			</p>

			<h2 className='text-medium text-2xl'>Information Collection and Use</h2>
			<p>
				We collect information when you use our service, such as the links you shorten and
				share, and information about how those links are used. We use this information to
				improve our service and to provide you with a better user experience. We may also
				use the information we collect to analyze usage trends, to personalize your
				experience, and to send you promotional materials about our service.
			</p>

			<h2 className='text-bold text-2xl'>Information Sharing</h2>
			<p>
				We do not sell or rent your information to third parties. We may share your
				information with third-party service providers who work on our behalf to provide
				you with the service, such as hosting providers, analytics providers, and security
				providers. These third parties are bound by strict confidentiality agreements and
				are only permitted to use your information as necessary to provide the services we
				have contracted them to perform. We may also disclose your information if required
				to do so by law or in response to a valid request by a government or law
				enforcement authority.
			</p>

			<h2 className='text-bold text-2xl'>Security</h2>
			<p>
				We take reasonable measures to protect your information from unauthorized access,
				use, or disclosure. However, no method of electronic storage or transmission is
				100% secure, and we cannot guarantee the absolute security of your information.
			</p>

			<h2 className='text-bold text-2xl'>Changes to this Privacy Policy</h2>
			<p>
				We may update this privacy policy from time to time. If we make any material
				changes, we will notify you by email (sent to the email address specified in your
				account) or by means of a notice on our website prior to the change becoming
				effective. We encourage you to review this privacy policy periodically to stay
				informed about how we are protecting the personal information we collect. Your
				continued use of our service constitutes your agreement to this privacy policy and
				any updates.
			</p>

			<h2 className='text-bold text-2xl'>Contact Us</h2>
			<p>
				If you have any questions about this privacy policy, please contact us at{' '}
				<a href='mailto:support@barely.io'>support@barely.io</a>
			</p>

			<Link href='/'>
				<span className='py-10 text-blue '>Return to barely.link</span>
			</Link>
		</div>
	);
};

export default PrivacyPage;
