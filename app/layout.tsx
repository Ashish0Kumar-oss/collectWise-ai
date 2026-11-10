import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CollectWise AI | Get Paid Faster. Let AI Handle the Follow-ups.',
  description:
    'AI-powered payment collection and financial management platform for freelancers and small businesses. Streamline invoice tracking, automate PayPal invoicing, and collect receivables with smart reminders.',
  openGraph: {
    title: 'CollectWise AI | Get Paid Faster. Let AI Handle the Follow-ups.',
    description:
      'AI-powered payment collection and financial management platform for freelancers and small businesses.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CollectWise AI | Get Paid Faster. Let AI Handle the Follow-ups.',
    description:
      'AI-powered payment collection and financial management platform for freelancers and small businesses.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-zinc-100 antialiased selection:bg-red-600 selection:text-white min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
