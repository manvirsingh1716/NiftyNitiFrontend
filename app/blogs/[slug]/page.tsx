import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  readTime: number;
  publishedAt: string;
  updatedAt: string;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blogs/${params.slug}`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });
  
  if (response.status === 404) {
    notFound();
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch blog post');
  }
  
  const post: BlogPost = await response.json();

  return (
    <article className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link 
              href="/blogs"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Blog
            </Link>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <time dateTime={post.publishedAt}>
                {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
              </time>
              <span className="mx-2">•</span>
              <span>{post.readTime} min read</span>
              {new Date(post.updatedAt) > new Date(post.publishedAt) && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  Updated
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {post.title}
            </h1>
          </div>
          
          <div 
            className="prose prose-indigo prose-lg text-gray-500 mx-auto"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/blogs"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
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

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blogs/${params.slug}`);
  
  if (!response.ok) {
    return {
      title: 'Blog Post',
      description: 'Blog post not found',
    };
  }
  
  const post = await response.json();
  
  return {
    title: `${post.title} | NiftyNiti Blog`,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: ['NiftyNiti Team'],
    },
  };
}