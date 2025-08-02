import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface Context {
  params: {
    slug: string;
  };
}

export async function GET(request: Request, { params }: Context) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: params.slug },
    });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Don't return unpublished blogs unless it's an admin request
    if (!blog.published) {
      const isAdmin = request.headers.get('x-admin') === process.env.ADMIN_SECRET;
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const body = await request.json();
    
    const updateData: Prisma.BlogUpdateInput = {
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      readTime: body.readTime,
    };

    // Only update slug if it's provided and different
    if (body.slug && body.slug !== params.slug) {
      updateData.slug = body.slug;
    }

    // Update publishedAt if publishing
    if (body.published !== undefined) {
      updateData.published = body.published;
      updateData.publishedAt = body.published ? new Date() : null;
    }

    const updatedBlog = await prisma.blog.update({
      where: { slug: params.slug },
      data: updateData,
    });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A blog with this slug already exists' },
          { status: 400 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    await prisma.blog.delete({
      where: { slug: params.slug },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting blog:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
