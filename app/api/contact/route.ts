import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, city, propertyType, area, message } = body;

    // Validate required fields
    if (!name || !email || !propertyType || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email' },
        { status: 400 }
      );
    }

    // Log the submission (in production, send to email service)
    console.log('=== New Project Request ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone || 'N/A');
    console.log('City:', city || 'N/A');
    console.log('Property Type:', propertyType);
    console.log('Area:', area || 'N/A');
    console.log('Message:', message);
    console.log('===========================');

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // TODO: Save to database or CRM
    // TODO: Send auto-reply to client

    return NextResponse.json({
      success: true,
      message: 'Thank you! We will contact you within 24 hours.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
