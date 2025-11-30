import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock the components to isolate the page test
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>;
  };
});

jest.mock('@/components/Hero', () => {
  return function MockHero() {
    return <section data-testid="hero">Hero</section>;
  };
});

jest.mock('@/components/Products', () => {
  return function MockProducts() {
    return <section data-testid="products">Products</section>;
  };
});

jest.mock('@/components/About', () => {
  return function MockAbout() {
    return <section data-testid="about">About</section>;
  };
});

jest.mock('@/components/Features', () => {
  return function MockFeatures() {
    return <section data-testid="features">Features</section>;
  };
});

jest.mock('@/components/Testimonials', () => {
  return function MockTestimonials() {
    return <section data-testid="testimonials">Testimonials</section>;
  };
});

jest.mock('@/components/Contact', () => {
  return function MockContact() {
    return <section data-testid="contact">Contact</section>;
  };
});

jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>;
  };
});

describe('Home Page', () => {
  it('renders the header component', () => {
    render(<Home />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the hero section', () => {
    render(<Home />);
    expect(screen.getByTestId('hero')).toBeInTheDocument();
  });

  it('renders the products section', () => {
    render(<Home />);
    expect(screen.getByTestId('products')).toBeInTheDocument();
  });

  it('renders the about section', () => {
    render(<Home />);
    expect(screen.getByTestId('about')).toBeInTheDocument();
  });

  it('renders the features section', () => {
    render(<Home />);
    expect(screen.getByTestId('features')).toBeInTheDocument();
  });

  it('renders the testimonials section', () => {
    render(<Home />);
    expect(screen.getByTestId('testimonials')).toBeInTheDocument();
  });

  it('renders the contact section', () => {
    render(<Home />);
    expect(screen.getByTestId('contact')).toBeInTheDocument();
  });

  it('renders the footer component', () => {
    render(<Home />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders all sections in the correct order', () => {
    render(<Home />);
    
    const main = screen.getByRole('main');
    const sections = main.querySelectorAll('section');
    
    expect(sections[0]).toHaveAttribute('data-testid', 'hero');
    expect(sections[1]).toHaveAttribute('data-testid', 'products');
    expect(sections[2]).toHaveAttribute('data-testid', 'about');
    expect(sections[3]).toHaveAttribute('data-testid', 'features');
    expect(sections[4]).toHaveAttribute('data-testid', 'testimonials');
    expect(sections[5]).toHaveAttribute('data-testid', 'contact');
  });
});

