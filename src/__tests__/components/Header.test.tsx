import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';

describe('Header', () => {
  const mockSetMobileMenuOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the logo and brand name', () => {
    render(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    expect(screen.getByText('Golden Harvest')).toBeInTheDocument();
    expect(screen.getByText('Farm & Poultry')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders the Order Now button', () => {
    render(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    const orderButtons = screen.getAllByRole('link', { name: /order now/i });
    expect(orderButtons.length).toBeGreaterThan(0);
  });

  it('toggles mobile menu when menu button is clicked', () => {
    render(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);
    
    expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(true);
  });

  it('shows mobile menu when mobileMenuOpen is true', () => {
    render(<Header mobileMenuOpen={true} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    // Mobile menu should show navigation links in the mobile dropdown
    const homeLinks = screen.getAllByRole('link', { name: /home/i });
    expect(homeLinks.length).toBeGreaterThan(1); // Desktop + mobile
  });

  it('closes mobile menu when a link is clicked', () => {
    render(<Header mobileMenuOpen={true} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    const homeLinks = screen.getAllByRole('link', { name: /home/i });
    // Click the mobile menu link (second one)
    fireEvent.click(homeLinks[1]);
    
    expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
  });

  it('has correct href for navigation links', () => {
    render(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '#home');
    expect(screen.getByRole('link', { name: /^products$/i })).toHaveAttribute('href', '#products');
    expect(screen.getByRole('link', { name: /^about$/i })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: /^contact$/i })).toHaveAttribute('href', '#contact');
  });
});

