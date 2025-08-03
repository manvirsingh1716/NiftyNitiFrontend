import { Metadata } from 'next';
import { EnvelopeIcon, ChartBarIcon, CpuChipIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'About | NiftyNiti - ML Engineer',
  description: 'Learn about the ML engineer behind NiftyNiti and the journey of building AI-powered stock market predictions.',
};

const whyBuiltCards = [
  {
    title: 'Democratizing Market Insights',
    description: 'I believe everyone should have access to sophisticated market analysis tools, not just institutional investors.',
    icon: ChartBarIcon,
  },
  {
    title: 'Leveraging AI for Better Decisions',
    description: 'Using cutting-edge ML algorithms to provide accurate market predictions and actionable insights.',
    icon: CpuChipIcon,
  },
  {
    title: 'Continuous Learning',
    description: 'The market evolves, and so do we. Our models continuously learn and improve over time.',
    icon: ArrowPathIcon,
  },
];

const skills = [
  'Python', 'TensorFlow', 'PyTorch', 'Pandas',
  'Scikit-learn', 'Time Series Analysis', 'Deep Learning', 'NLP',
  'AWS', 'Docker', 'Kubernetes', 'React/Next.js',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section WITHOUT Image */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Manvir Singh</h1>
          <p className="mt-2 text-lg text-blue-700 font-semibold">
            ML Engineer &amp; Creator of NiftyNiti
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed max-w-2xl">
            I'm a passionate Machine Learning Engineer with expertise in building AI-powered solutions for financial markets. I specialize in predictive models that empower traders with actionable insights.
          </p>
        </div>

        {/* My Journey Section */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">My Journey</h2>
          <div className="space-y-6 max-w-3xl mx-auto text-gray-700 prose prose-blue">
            <p><strong>Master's in Computer Science</strong> with focus on Machine Learning</p>
            <p><strong>5+ years of experience</strong> in developing ML models for financial markets</p>
            <p><strong>Specialized</strong> in time series analysis and predictive modeling</p>
            <p><strong>Passionate</strong> about making complex financial data accessible to everyone</p>
          </div>
        </section>

        {/* Why I Built NiftyNiti Section */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why I Built NiftyNiti</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyBuiltCards.map(({ title, description, icon: Icon }, idx) => (
              <div
                key={idx}
                className="bg-white border border-blue-100 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <Icon className="h-12 w-12 text-blue-600 mb-4 mx-auto md:mx-0" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center md:text-left">{title}</h3>
                <p className="text-gray-600 text-center md:text-left">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Expertise Section */}
        <section className="mt-20 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Technical Expertise</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 shadow-sm text-blue-900 font-semibold"
              >
                <span className="w-3 h-3 bg-blue-600 rounded-full inline-block"></span>
                {skill}
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <a
            href="/contact"
            className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition transform duration-300"
          >
            <EnvelopeIcon className="h-6 w-6" />
            Get in Touch
          </a>
          {/* Social links could be added here */}
        </div>
      </div>
    </div>
  );
}
