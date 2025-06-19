import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ContactInquiryEmailProps {
  name: string;
  email: string;
  artistName?: string;
  monthlyListeners?: string;
  service?: string;
  message: string;
}

export function ContactInquiryEmail({
  name,
  email,
  artistName,
  monthlyListeners,
  service,
  message,
}: ContactInquiryEmailProps) {
  const serviceName = service ? `${service.charAt(0).toUpperCase()}${service.slice(1)}+` : 'Not specified';
  
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Contact Form Submission</Heading>
          
          <Section style={section}>
            <Text style={label}>Name:</Text>
            <Text style={value}>{name}</Text>
          </Section>
          
          <Section style={section}>
            <Text style={label}>Email:</Text>
            <Text style={value}>{email}</Text>
          </Section>
          
          {artistName && (
            <Section style={section}>
              <Text style={label}>Artist/Band Name:</Text>
              <Text style={value}>{artistName}</Text>
            </Section>
          )}
          
          {monthlyListeners && (
            <Section style={section}>
              <Text style={label}>Monthly Listeners:</Text>
              <Text style={value}>{monthlyListeners}</Text>
            </Section>
          )}
          
          <Section style={section}>
            <Text style={label}>Service Interest:</Text>
            <Text style={value}>{serviceName}</Text>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={section}>
            <Text style={label}>Message:</Text>
            <Text style={messageText}>{message}</Text>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            This email was sent from the Barely Sparrow contact form.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '5px',
  margin: '0 auto',
  padding: '45px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 30px',
};

const section = {
  margin: '0 0 20px',
};

const label = {
  color: '#666',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 5px',
};

const value = {
  color: '#333',
  fontSize: '16px',
  margin: '0',
};

const messageText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const hr = {
  border: 'none',
  borderTop: '1px solid #eaeaea',
  margin: '30px 0',
};

const footer = {
  color: '#999',
  fontSize: '12px',
  marginTop: '20px',
};