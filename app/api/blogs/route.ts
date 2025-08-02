import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        readTime: true,
        publishedAt: true,
      },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate slug from title if not provided
    const slug = body.slug || 
      body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');

    const blogData: Prisma.BlogCreateInput = {
      title: body.title,
      slug,
      excerpt: body.excerpt || body.content.substring(0, 160) + '...',
      content: body.content,
      readTime: body.readTime || Math.ceil(body.content.split(/\s+/).length / 200), // 200 words per minute
      published: body.published || false,
      publishedAt: body.published ? new Date() : null,
    };

    const blog = await prisma.blog.create({
      data: blogData,
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A blog with this slug already exists' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
