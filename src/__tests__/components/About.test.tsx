import { render, screen } from '@testing-library/react';
import About from '@/components/About';

describe('About', () => {
  it('renders the section heading', () => {
    render(<About />);
    
    expect(screen.getByText('Our Story')).toBeInTheDocument();
    expect(screen.getByText('Three Generations of')).toBeInTheDocument();
    expect(screen.getByText('Farming Excellence')).toBeInTheDocument();
  });

  it('renders the description paragraphs', () => {
    render(<About />);
    
    expect(screen.getByText(/Nestled in the heart of the countryside/i)).toBeInTheDocument();
    expect(screen.getByText(/Our commitment to ethical farming practices/i)).toBeInTheDocument();
  });

  it('renders the Since 1952 badge', () => {
    render(<About />);
    
    expect(screen.getByText('Since 1952')).toBeInTheDocument();
  });

  it('renders the acres statistic', () => {
    render(<About />);
    
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('Acres of Farmland')).toBeInTheDocument();
  });

  it('renders the value propositions', () => {
    render(<About />);
    
    expect(screen.getByText('100% Organic')).toBeInTheDocument();
    expect(screen.getByText('No pesticides or chemicals')).toBeInTheDocument();
    
    expect(screen.getByText('Free Range')).toBeInTheDocument();
    expect(screen.getByText('Happy, healthy animals')).toBeInTheDocument();
    
    expect(screen.getByText('Farm to Table')).toBeInTheDocument();
    expect(screen.getByText('Delivered fresh daily')).toBeInTheDocument();
    
    expect(screen.getByText('Sustainable')).toBeInTheDocument();
    expect(screen.getByText('Eco-friendly practices')).toBeInTheDocument();
  });

  it('has the correct section id for navigation', () => {
    render(<About />);
    
    const section = screen.getByText('Our Story').closest('section');
    expect(section).toHaveAttribute('id', 'about');
  });
});

