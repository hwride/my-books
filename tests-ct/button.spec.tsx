import { test, expect } from '@playwright/experimental-ct-react';
import { Button } from '../components/ui/button';

test.describe('Button component', () => {
  test('renders a button with default variant and size', async ({ mount }) => {
    const component = await mount(<Button>Click me</Button>);
    
    // Check if the button is visible
    await expect(component).toBeVisible();
    
    // Check if the button has the correct text
    await expect(component).toContainText('Click me');
    
    // Check if the button has the default classes
    const buttonClass = await component.getAttribute('class');
    expect(buttonClass).toContain('bg-slate-900');
    expect(buttonClass).toContain('h-9 px-4 py-2');
  });

  test('renders a button with destructive variant', async ({ mount }) => {
    const component = await mount(<Button variant="destructive">Delete</Button>);
    
    // Check if the button is visible
    await expect(component).toBeVisible();
    
    // Check if the button has the correct text
    await expect(component).toContainText('Delete');
    
    // Check if the button has the destructive classes
    const buttonClass = await component.getAttribute('class');
    expect(buttonClass).toContain('bg-red-500');
  });

  test('renders a button with small size', async ({ mount }) => {
    const component = await mount(<Button size="sm">Small Button</Button>);
    
    // Check if the button is visible
    await expect(component).toBeVisible();
    
    // Check if the button has the correct text
    await expect(component).toContainText('Small Button');
    
    // Check if the button has the small size classes
    const buttonClass = await component.getAttribute('class');
    expect(buttonClass).toContain('h-8 rounded-md px-3 text-xs');
  });
});