import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';
import { CartProvider } from '@/context/CartContext';

// Helper to render with CartProvider
const renderWithCart = (component: React.ReactElement) => {
  return render(<CartProvider>{component}</CartProvider>);
};

describe('Header', () => {
  const mockSetMobileMenuOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the logo and brand name', () => {
    renderWithCart(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    expect(screen.getByText('Golden Harvest')).toBeInTheDocument();
    expect(screen.getByText('Farm & Poultry')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithCart(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders the Order Now button', () => {
    renderWithCart(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    const orderButtons = screen.getAllByRole('link', { name: /order now/i });
    expect(orderButtons.length).toBeGreaterThan(0);
  });

  it('toggles mobile menu when menu button is clicked', () => {
    renderWithCart(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);
    
    expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(true);
  });

  it('shows mobile menu when mobileMenuOpen is true', () => {
    renderWithCart(<Header mobileMenuOpen={true} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    // Mobile menu should show navigation links in the mobile dropdown
    const homeLinks = screen.getAllByRole('link', { name: /home/i });
    expect(homeLinks.length).toBeGreaterThan(1); // Desktop + mobile
  });

  it('closes mobile menu when a link is clicked', () => {
    renderWithCart(<Header mobileMenuOpen={true} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    const homeLinks = screen.getAllByRole('link', { name: /home/i });
    // Click the mobile menu link (second one)
    fireEvent.click(homeLinks[1]);
    
    expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
  });

  it('has correct href for navigation links', () => {
    renderWithCart(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '#home');
    expect(screen.getByRole('link', { name: /^products$/i })).toHaveAttribute('href', '#products');
    expect(screen.getByRole('link', { name: /^about$/i })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: /^contact$/i })).toHaveAttribute('href', '#contact');
  });

  it('renders cart button', () => {
    renderWithCart(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    // Should have cart buttons (desktop and mobile)
    const cartButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg path[d*="M3 3h2l.4 2"]')
    );
    expect(cartButtons.length).toBeGreaterThan(0);
  });

  it('does not show cart count badge when cart is empty', () => {
    renderWithCart(<Header mobileMenuOpen={false} setMobileMenuOpen={mockSetMobileMenuOpen} />);
    
    // Cart count badge should not exist when cart is empty
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });
});
