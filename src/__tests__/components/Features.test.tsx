import { render, screen } from '@testing-library/react';
import Features from '@/components/Features';

describe('Features', () => {
  it('renders the section heading', () => {
    render(<Features />);
    
    expect(screen.getByText('Why Choose Us')).toBeInTheDocument();
    expect(screen.getByText('The Golden Harvest Difference')).toBeInTheDocument();
  });

  it('renders the section description', () => {
    render(<Features />);
    
    expect(screen.getByText(/When you choose Golden Harvest/i)).toBeInTheDocument();
  });

  it('renders all six features', () => {
    render(<Features />);
    
    expect(screen.getByText('Fresh Every Morning')).toBeInTheDocument();
    expect(screen.getByText('Quality Tested')).toBeInTheDocument();
    expect(screen.getByText('Fast Delivery')).toBeInTheDocument();
    expect(screen.getByText('Satisfaction Guaranteed')).toBeInTheDocument();
    expect(screen.getByText('No Antibiotics')).toBeInTheDocument();
    expect(screen.getByText('Family Owned')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<Features />);
    
    expect(screen.getByText(/Our products are harvested and prepared at the break of dawn/i)).toBeInTheDocument();
    expect(screen.getByText(/Every batch undergoes rigorous quality checks/i)).toBeInTheDocument();
    expect(screen.getByText(/From our farm to your doorstep within 24 hours/i)).toBeInTheDocument();
    expect(screen.getByText(/We offer a 100% money-back guarantee/i)).toBeInTheDocument();
    expect(screen.getByText(/Our poultry is raised without antibiotics/i)).toBeInTheDocument();
    expect(screen.getByText(/Three generations of farming expertise/i)).toBeInTheDocument();
  });

  it('renders the CTA banner', () => {
    render(<Features />);
    
    expect(screen.getByText('Ready to Taste the Difference?')).toBeInTheDocument();
    expect(screen.getByText(/First order gets 15% off/i)).toBeInTheDocument();
  });

  it('renders the Get Started button', () => {
    render(<Features />);
    
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '#contact');
  });
});

