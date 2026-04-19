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

    // Send email via Resend only if API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey !== 're_1234567890') {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: 'TETÉ Portfolio <onboarding@resend.dev>',
          to: [process.env.CONTACT_EMAIL || 'tetiana.korolyuk@gmail.com'],
          subject: `New Project Request from ${name}`,
          html: `
            <h2>New Project Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>City:</strong> ${city || 'N/A'}</p>
            <p><strong>Property Type:</strong> ${propertyType}</p>
            <p><strong>Area:</strong> ${area || 'N/A'} sq ft</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        });

        // Send auto-reply to client
        await resend.emails.send({
          from: 'TETÉ Portfolio <onboarding@resend.dev>',
          to: [email],
          subject: 'Thank you for your inquiry - TETÉ Portfolio',
          html: `
            <h2>Thank you for contacting TETÉ Portfolio</h2>
            <p>Dear ${name},</p>
            <p>Thank you for your interest in our interior design services. We have received your project inquiry and will review it carefully.</p>
            <p>We will get back to you within 24 hours to discuss your project in more detail.</p>
            <p>Best regards,<br/>TETÉ Portfolio</p>
            <p><em>Toronto, Ontario</em></p>
          `,
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
        // Continue - don't fail the request if email fails
      }
    } else {
      // Dev mode - just log
      console.log('=== New Project Request (Dev Mode) ===');
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Phone:', phone || 'N/A');
      console.log('City:', city || 'N/A');
      console.log('Property Type:', propertyType);
      console.log('Area:', area || 'N/A');
      console.log('Message:', message);
      console.log('======================================');
      console.log('Note: Set RESEND_API_KEY in Vercel Environment Variables to send real emails');
    }

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
