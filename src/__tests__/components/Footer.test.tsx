import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer', () => {
  it('renders the logo and brand name', () => {
    render(<Footer />);
    
    expect(screen.getByText('Golden Harvest')).toBeInTheDocument();
    expect(screen.getByText('Farm & Poultry')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<Footer />);
    
    expect(screen.getByText(/Three generations of farming excellence/i)).toBeInTheDocument();
  });

  it('renders the newsletter section', () => {
    render(<Footer />);
    
    expect(screen.getByText('Subscribe to our newsletter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
  });

  it('renders Products links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /fresh poultry/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /farm eggs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /organic produce/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /seasonal items/i })).toBeInTheDocument();
  });

  it('renders Company links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('heading', { name: /company/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about us/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /our farm/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sustainability/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /careers/i })).toBeInTheDocument();
  });

  it('renders Support links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('heading', { name: /support/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /faqs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shipping info/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /returns/i })).toBeInTheDocument();
  });

  it('renders the copyright notice with current year', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} Golden Harvest Farm`))).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cookie policy/i })).toBeInTheDocument();
  });

  it('has correct href for product links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('link', { name: /fresh poultry/i })).toHaveAttribute('href', '#products');
    expect(screen.getByRole('link', { name: /farm eggs/i })).toHaveAttribute('href', '#products');
  });

  it('has correct href for company links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('link', { name: /about us/i })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: /our farm/i })).toHaveAttribute('href', '#about');
  });
});

