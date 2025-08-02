import Link from 'next/link';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  readTime: number;
  publishedAt: string;
}

export default async function BlogPage() {
  const response = await fetch(`http://localhost:3000/api/blogs`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });
  
  if (!response.ok) {
    return <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="text-red-500">Failed to load blog posts. Please try again later.</div>
    </div>;
  }
  
  const posts: BlogPost[] = await response.json();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Our Blog
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Insights, stories, and updates from our team
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts found.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
            {posts.map((post) => (
              <article key={post.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg bg-white">
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600">
                      {post.readTime} min read • {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                    </p>
                    <Link href={`/blogs/${post.slug}`} className="block mt-2">
                      <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-3 text-base text-gray-500">
                        {post.excerpt}
                      </p>
                    </Link>
                  </div>
                  <div className="mt-4">
                    <Link 
                      href={`/blogs/${post.slug}`}
                      className="text-base font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Read full story →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
