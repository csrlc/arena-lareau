// Test script to verify navbar functionality
console.log('=== Navbar Functionality Test ===');

// Wait a bit for initialization
setTimeout(() => {
  // Check if navbar elements are loaded
  const sidebarToggle = document.querySelector('.sidebar-toggle-btn');
  const dropdownTrigger = document.querySelector('.dropdown-trigger');
  const mainSidebar = document.getElementById('main-sidebar');
  const dropdownContent = document.querySelector('.dropdown-content');

  console.log('Sidebar toggle button:', sidebarToggle ? 'FOUND' : 'NOT FOUND');
  console.log('Dropdown trigger button:', dropdownTrigger ? 'FOUND' : 'NOT FOUND');
  console.log('Main sidebar:', mainSidebar ? 'FOUND' : 'NOT FOUND');
  console.log('Dropdown content:', dropdownContent ? 'FOUND' : 'NOT FOUND');

  // Check if functions are available globally
  console.log('toggleSidebar function:', typeof window.toggleSidebar === 'function' ? 'AVAILABLE' : 'NOT AVAILABLE');
  console.log('toggleDropdown function:', typeof window.toggleDropdown === 'function' ? 'AVAILABLE' : 'NOT AVAILABLE');

  // Check default states
  console.log('Sidebar open by default:', mainSidebar?.classList.contains('active') ? 'YES' : 'NO');
  console.log('Dropdown open by default:', dropdownContent?.classList.contains('active') ? 'YES' : 'NO');

  // Check if first sidebar item is active
  const firstSidebarLink = document.querySelector('.sidebar-link[data-target="main-galleries-cpa"]');
  console.log('First sidebar item (Galeries Photos) active:', firstSidebarLink?.classList.contains('active') ? 'YES' : 'NO');

  // Test click events if elements exist
  if (sidebarToggle) {
    console.log('Sidebar toggle text:', sidebarToggle.querySelector('.sidebar-text')?.textContent?.trim());
    console.log('Sidebar toggle has active class:', sidebarToggle.classList.contains('active') ? 'YES' : 'NO');
  }

  if (dropdownTrigger) {
    console.log('Dropdown trigger text:', dropdownTrigger.querySelector('.dropdown-text')?.textContent?.trim());
    console.log('Dropdown trigger has active class:', dropdownTrigger.classList.contains('active') ? 'YES' : 'NO');
  }

  console.log('=== Navbar Test Complete ===');
}, 500);

// Test calendar overlay functionality
setTimeout(() => {
  console.log('=== Calendar Overlay Test ===');

  const calendarOverlay = document.getElementById('calendar-overlay');
  console.log('Calendar overlay exists:', calendarOverlay ? 'YES' : 'NO');

  console.log('showCalendarOverlay function:', typeof window.showCalendarOverlay === 'function' ? 'AVAILABLE' : 'NOT AVAILABLE');
  console.log('hideCalendarOverlay function:', typeof window.hideCalendarOverlay === 'function' ? 'AVAILABLE' : 'NOT AVAILABLE');

  // Test booking buttons
  const bookingButtons = document.querySelectorAll('.booking-trigger-btn');
  console.log('Booking buttons found:', bookingButtons.length);

  if (bookingButtons.length > 0) {
    console.log('First booking button text:', bookingButtons[0].textContent?.trim());
  }

  console.log('=== Calendar Overlay Test Complete ===');
}, 1000);