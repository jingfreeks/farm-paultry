import { render, screen } from '@testing-library/react';
import Testimonials from '@/components/Testimonials';

describe('Testimonials', () => {
  it('renders the section heading', () => {
    render(<Testimonials />);
    
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
    expect(screen.getByText('What Our Customers Say')).toBeInTheDocument();
  });

  it('renders the section description', () => {
    render(<Testimonials />);
    
    expect(screen.getByText(/Don't just take our word for it/i)).toBeInTheDocument();
  });

  it('renders all three testimonials', () => {
    render(<Testimonials />);
    
    expect(screen.getByText(/The quality of their chicken is outstanding/i)).toBeInTheDocument();
    expect(screen.getByText(/I've been ordering eggs from Golden Harvest/i)).toBeInTheDocument();
    expect(screen.getByText(/Fast delivery, excellent packaging/i)).toBeInTheDocument();
  });

  it('renders testimonial authors', () => {
    render(<Testimonials />);
    
    expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
    expect(screen.getByText('Michael Chen')).toBeInTheDocument();
    expect(screen.getByText('Emily Rodriguez')).toBeInTheDocument();
  });

  it('renders author roles', () => {
    render(<Testimonials />);
    
    expect(screen.getByText('Home Chef')).toBeInTheDocument();
    expect(screen.getByText('Restaurant Owner')).toBeInTheDocument();
    expect(screen.getByText('Busy Mom of 3')).toBeInTheDocument();
  });

  it('renders star ratings', () => {
    render(<Testimonials />);
    
    // Each testimonial has 5 stars (3 testimonials = 15 stars)
    const stars = document.querySelectorAll('svg.text-gold');
    expect(stars.length).toBe(15);
  });

  it('renders trust statistics', () => {
    render(<Testimonials />);
    
    expect(screen.getByText('4.9/5')).toBeInTheDocument();
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
    
    expect(screen.getByText('15,000+')).toBeInTheDocument();
    expect(screen.getByText('Happy Customers')).toBeInTheDocument();
    
    expect(screen.getByText('98%')).toBeInTheDocument();
    expect(screen.getByText('Would Recommend')).toBeInTheDocument();
  });
});

