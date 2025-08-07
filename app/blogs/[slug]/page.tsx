import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Metadata, ResolvingMetadata } from 'next';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  readTime: number;
  publishedAt: string;
  updatedAt: string;
  featuredImage?: string;
  tags?: string[];
  author?: {
    name: string;
    image?: string;
    bio?: string;
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blogs/${params.slug}`, {
    next: { revalidate: 60 },
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error('Failed to fetch blog post');
  }

  const post: BlogPost = await response.json();
  const isUpdated = new Date(post.updatedAt) > new Date(post.publishedAt);
  const publishedDate = parseISO(post.publishedAt);
  const updatedDate = isUpdated ? parseISO(post.updatedAt) : null;

  return (
    <article className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blogs"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-10 text-base font-medium transition-colors duration-200 group"
          >
            <svg className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Blog
          </Link>

          <header className="mb-14">
            <div className="flex items-center text-sm text-gray-500 mb-8 space-x-4">
              <time dateTime={post.publishedAt} className="text-gray-600">
                {format(publishedDate, 'MMMM d, yyyy')}
              </time>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">{post.readTime} min read</span>
              {isUpdated && (
                <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                  Updated {format(updatedDate!, 'MMM d, yyyy')}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {post.featuredImage && (
            <div className="mb-14 rounded-xl overflow-hidden shadow-lg">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.8',
              '--tw-prose-headings': '#1f2937',
              '--tw-prose-body': '#374151',
              '--tw-prose-links': '#4f46e5',
              '--tw-prose-bold': '#111827',
              '--tw-prose-captions': '#6b7280',
              '--tw-prose-code': '#111827',
              '--tw-prose-pre-bg': '#1f2937',
              '--tw-prose-pre-code': '#f9fafb',
            } as React.CSSProperties}
          >
            <div
              className="prose-p:my-6 
                        prose-headings:mt-12 prose-headings:mb-6 
                        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                        prose-ul:list-disc prose-ol:list-decimal
                        prose-li:my-2
                        prose-blockquote:border-l-4 prose-blockquote:border-indigo-200 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                        prose-a:text-indigo-600 hover:prose-a:text-indigo-800 prose-a:underline
                        prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {(post.author || post.tags?.length) && (
            <footer className="mt-16 pt-8 border-t border-gray-200">
              {post.author && (
                <div className="flex items-center space-x-4 mb-8">
                  {post.author.image && (
                    <img
                      src={post.author.image}
                      alt={post.author.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{post.author.name}</h3>
                    {post.author.bio && (
                      <p className="text-gray-600 mt-1">{post.author.bio}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-500 mb-4">TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${tag.toLowerCase()}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </footer>
          )}

          <div className="mt-16 pt-8 border-t border-gray-200">
            <Link
              href="/blogs"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-base font-medium transition-colors duration-200"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to all posts
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blogs/${params.slug}`);

  if (!response.ok) {
    return {
      title: 'Blog Post',
      description: 'Blog post not found',
    };
  }

  const post: BlogPost = await response.json();
  const publishedTime = new Date(post.publishedAt).toISOString();
  const modifiedTime = new Date(post.updatedAt).toISOString();
  const images = post.featuredImage ? [post.featuredImage] : [];
  const authors = post.author?.name ? [{ name: post.author.name }] : [];

  return {
    title: `${post.title} | NiftyNiti Blog`,
    description: post.excerpt || post.content.substring(0, 160),
    keywords: post.tags ? post.tags.join(', ') : '',
    authors: post.author?.name ? { name: post.author.name } : { name: 'NiftyNiti Team' },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      type: 'article',
      publishedTime,
      modifiedTime,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/blogs/${post.slug}`,
      images,
      authors: post.author?.name ? [post.author.name] : ['NiftyNiti Team'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blogs/${post.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
