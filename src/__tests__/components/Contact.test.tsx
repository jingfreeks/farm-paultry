import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '@/components/Contact';

describe('Contact', () => {
  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the section heading', () => {
    render(<Contact />);
    
    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
    expect(screen.getByText("Let's Start a")).toBeInTheDocument();
    expect(screen.getByText('Conversation')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Contact />);
    
    expect(screen.getByText(/Have questions about our products/i)).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<Contact />);
    
    expect(screen.getByText('Visit Our Farm')).toBeInTheDocument();
    expect(screen.getByText(/123 Country Road/i)).toBeInTheDocument();
    
    expect(screen.getByText('Call Us')).toBeInTheDocument();
    expect(screen.getByText(/\(555\) 123-4567/i)).toBeInTheDocument();
    
    expect(screen.getByText('Email Us')).toBeInTheDocument();
    expect(screen.getByText(/hello@goldenharvestfarm.com/i)).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Contact />);
    
    expect(screen.getByText('Follow us on social media')).toBeInTheDocument();
    // Check for social links (3 social icons)
    const socialLinksContainer = screen.getByText('Follow us on social media').parentElement;
    const socialLinks = socialLinksContainer?.querySelectorAll('a');
    expect(socialLinks?.length).toBe(3);
  });

  it('renders the contact form', () => {
    render(<Contact />);
    
    expect(screen.getByText('Send us a Message')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your message/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<Contact />);
    
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('allows users to fill in the form', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const messageInput = screen.getByLabelText(/your message/i);
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(phoneInput, '555-123-4567');
    await user.type(messageInput, 'I would like to order some fresh eggs.');
    
    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(phoneInput).toHaveValue('555-123-4567');
    expect(messageInput).toHaveValue('I would like to order some fresh eggs.');
  });

  it('submits the form and shows alert', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const messageInput = screen.getByLabelText(/your message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(messageInput, 'Test message');
    
    await user.click(submitButton);
    
    expect(window.alert).toHaveBeenCalledWith("Thank you for your message! We'll get back to you soon.");
  });

  it('clears the form after submission', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const messageInput = screen.getByLabelText(/your message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(messageInput, 'Test message');
    
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
      expect(messageInput).toHaveValue('');
    });
  });

  it('has correct section id for navigation', () => {
    render(<Contact />);
    
    const section = screen.getByText('Get In Touch').closest('section');
    expect(section).toHaveAttribute('id', 'contact');
  });
});

