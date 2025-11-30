import { render, screen, fireEvent } from '@testing-library/react';
import Products from '@/components/Products';

describe('Products', () => {
  it('renders the section heading', () => {
    render(<Products />);
    
    expect(screen.getByText('Our Products')).toBeInTheDocument();
    expect(screen.getByText('Fresh From the Farm')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Products />);
    
    expect(screen.getByText(/Discover our selection of premium poultry/i)).toBeInTheDocument();
  });

  it('renders category filter buttons', () => {
    render(<Products />);
    
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^poultry$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^eggs$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^produce$/i })).toBeInTheDocument();
  });

  it('renders all products by default', () => {
    render(<Products />);
    
    expect(screen.getByText('Whole Chicken')).toBeInTheDocument();
    expect(screen.getByText('Farm Fresh Eggs')).toBeInTheDocument();
    expect(screen.getByText('Organic Corn')).toBeInTheDocument();
  });

  it('filters products when category is clicked', () => {
    render(<Products />);
    
    // Click on Poultry filter
    fireEvent.click(screen.getByRole('button', { name: /^poultry$/i }));
    
    // Should show poultry products
    expect(screen.getByText('Whole Chicken')).toBeInTheDocument();
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
    
    // Should not show non-poultry products
    expect(screen.queryByText('Farm Fresh Eggs')).not.toBeInTheDocument();
    expect(screen.queryByText('Organic Corn')).not.toBeInTheDocument();
  });

  it('filters to eggs only when Eggs is clicked', () => {
    render(<Products />);
    
    fireEvent.click(screen.getByRole('button', { name: /^eggs$/i }));
    
    expect(screen.getByText('Farm Fresh Eggs')).toBeInTheDocument();
    expect(screen.getByText('Duck Eggs')).toBeInTheDocument();
    expect(screen.queryByText('Whole Chicken')).not.toBeInTheDocument();
  });

  it('filters to produce only when Produce is clicked', () => {
    render(<Products />);
    
    fireEvent.click(screen.getByRole('button', { name: /^produce$/i }));
    
    expect(screen.getByText('Organic Corn')).toBeInTheDocument();
    expect(screen.getByText('Fresh Vegetables Box')).toBeInTheDocument();
    expect(screen.queryByText('Whole Chicken')).not.toBeInTheDocument();
  });

  it('shows all products when All is clicked after filtering', () => {
    render(<Products />);
    
    // First filter to Poultry
    fireEvent.click(screen.getByRole('button', { name: /^poultry$/i }));
    expect(screen.queryByText('Farm Fresh Eggs')).not.toBeInTheDocument();
    
    // Then click All
    fireEvent.click(screen.getByRole('button', { name: /^all$/i }));
    expect(screen.getByText('Farm Fresh Eggs')).toBeInTheDocument();
    expect(screen.getByText('Whole Chicken')).toBeInTheDocument();
  });

  it('renders product prices', () => {
    render(<Products />);
    
    expect(screen.getByText('$12.99')).toBeInTheDocument(); // Whole Chicken
    expect(screen.getByText('$6.99')).toBeInTheDocument();  // Farm Fresh Eggs
  });

  it('renders product badges', () => {
    render(<Products />);
    
    expect(screen.getByText('Best Seller')).toBeInTheDocument();
    expect(screen.getByText('Organic')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('renders the View All Products button', () => {
    render(<Products />);
    
    expect(screen.getByRole('button', { name: /view all products/i })).toBeInTheDocument();
  });

  it('renders add to cart buttons for each product', () => {
    render(<Products />);
    
    // There should be multiple add buttons (one per product)
    const addButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg')
    );
    expect(addButtons.length).toBeGreaterThan(0);
  });
});

