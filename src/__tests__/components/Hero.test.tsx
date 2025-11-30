import { render, screen } from '@testing-library/react';
import Hero from '@/components/Hero';

describe('Hero', () => {
  it('renders the main heading', () => {
    render(<Hero />);
    
    expect(screen.getByText('Farm Fresh')).toBeInTheDocument();
    expect(screen.getByText('Goodness')).toBeInTheDocument();
    expect(screen.getByText('To Your Table')).toBeInTheDocument();
  });

  it('renders the tagline about family ownership', () => {
    render(<Hero />);
    
    expect(screen.getByText('Family-owned since 1952')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Hero />);
    
    expect(screen.getByText(/Experience the pure taste of nature/i)).toBeInTheDocument();
  });

  it('renders the Explore Products button', () => {
    render(<Hero />);
    
    expect(screen.getByRole('link', { name: /explore products/i })).toBeInTheDocument();
  });

  it('renders the Our Story button', () => {
    render(<Hero />);
    
    expect(screen.getByRole('link', { name: /our story/i })).toBeInTheDocument();
  });

  it('renders the statistics section', () => {
    render(<Hero />);
    
    expect(screen.getByText('70+')).toBeInTheDocument();
    expect(screen.getByText('Years of Experience')).toBeInTheDocument();
    expect(screen.getByText('15K+')).toBeInTheDocument();
    expect(screen.getByText('Happy Customers')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Organic Products')).toBeInTheDocument();
  });

  it('renders the Premium Poultry text', () => {
    render(<Hero />);
    
    expect(screen.getByText('Premium Poultry')).toBeInTheDocument();
  });

  it('renders the floating info cards', () => {
    render(<Hero />);
    
    expect(screen.getByText('Fresh Eggs')).toBeInTheDocument();
    expect(screen.getByText('Free-range daily')).toBeInTheDocument();
    expect(screen.getByText('Organic Feed')).toBeInTheDocument();
    expect(screen.getByText('No chemicals')).toBeInTheDocument();
  });

  it('has correct href for CTA buttons', () => {
    render(<Hero />);
    
    expect(screen.getByRole('link', { name: /explore products/i })).toHaveAttribute('href', '#products');
    expect(screen.getByRole('link', { name: /our story/i })).toHaveAttribute('href', '#about');
  });
});

