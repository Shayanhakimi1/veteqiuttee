import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppProvider, useApp } from '../../contexts/AppContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test component to access context
const TestComponent = () => {
  const {
    userData,
    selectedPet,
    consultationData,
    isLoading,
    isLoggedIn,
    saveUserData,
    savePetSelection,
    saveConsultationData,
    savePaymentData,
    clearAllData,
    generateTrackingCode,
    checkIsLoggedIn,
    setIsLoading,
    setIsLoggedIn
  } = useApp();

  return (
    <div>
      <div data-testid="userData">{JSON.stringify(userData)}</div>
      <div data-testid="selectedPet">{JSON.stringify(selectedPet)}</div>
      <div data-testid="consultationData">{JSON.stringify(consultationData)}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <div data-testid="isLoggedIn">{isLoggedIn.toString()}</div>
      <button onClick={() => saveUserData({ name: 'Test User' })}>Save User</button>
      <button onClick={() => savePetSelection({ type: 'dog' })}>Save Pet</button>
      <button onClick={() => saveConsultationData({ description: 'Test consultation' })}>Save Consultation</button>
      <button onClick={() => savePaymentData({ amount: 1000 })}>Save Payment</button>
      <button onClick={() => clearAllData()}>Clear All</button>
      <button onClick={() => setIsLoading(true)}>Set Loading</button>
      <button onClick={() => setIsLoggedIn(true)}>Set Logged In</button>
      <button onClick={() => generateTrackingCode()}>Generate Code</button>
      <button onClick={() => checkIsLoggedIn()}>Check Login</button>
    </div>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('provides initial state', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('userData')).toHaveTextContent('null');
    expect(screen.getByTestId('selectedPet')).toHaveTextContent('null');
    expect(screen.getByTestId('consultationData')).toHaveTextContent('null');
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('false');
  });

  test('loads data from localStorage on mount', () => {
    const userData = { name: 'John Doe' };
    const petData = { type: 'cat' };
    const consultationData = { description: 'Test' };
    const paymentData = { amount: 500 };

    localStorageMock.getItem.mockImplementation((key) => {
      switch (key) {
        case 'userData':
          return JSON.stringify(userData);
        case 'selectedPetType':
          return JSON.stringify(petData);
        case 'consultationData':
          return JSON.stringify(consultationData);
        case 'paymentData':
          return JSON.stringify(paymentData);
        case 'rememberLogin':
          return 'true';
        default:
          return null;
      }
    });

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('userData')).toHaveTextContent(JSON.stringify(userData));
    expect(screen.getByTestId('selectedPet')).toHaveTextContent(JSON.stringify(petData));
    expect(screen.getByTestId('consultationData')).toHaveTextContent(JSON.stringify(consultationData));
    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('true');
  });

  test('saveUserData updates state and localStorage', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByText('Save User').click();
    });

    expect(screen.getByTestId('userData')).toHaveTextContent('{"name":"Test User"}');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userData', '{"name":"Test User"}');
  });

  test('savePetSelection updates state and localStorage', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByText('Save Pet').click();
    });

    expect(screen.getByTestId('selectedPet')).toHaveTextContent('{"type":"dog"}');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('selectedPetType', '{"type":"dog"}');
  });

  test('saveConsultationData updates state and localStorage', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByText('Save Consultation').click();
    });

    expect(screen.getByTestId('consultationData')).toHaveTextContent('{"description":"Test consultation"}');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('consultationData', '{"description":"Test consultation"}');
  });

  test('savePaymentData saves to localStorage', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByText('Save Payment').click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('paymentData', '{"amount":1000}');
  });

  test('clearAllData clears state and localStorage', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // First set some data
    act(() => {
      screen.getByText('Save User').click();
      screen.getByText('Save Pet').click();
    });

    // Then clear all data
    act(() => {
      screen.getByText('Clear All').click();
    });

    expect(screen.getByTestId('userData')).toHaveTextContent('null');
    expect(screen.getByTestId('selectedPet')).toHaveTextContent('null');
    expect(screen.getByTestId('consultationData')).toHaveTextContent('null');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('userData');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('selectedPetType');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('consultationData');
  });

  test('setIsLoading updates loading state', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByText('Set Loading').click();
    });

    expect(screen.getByTestId('isLoading')).toHaveTextContent('true');
  });

  test('setIsLoggedIn updates login state', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    act(() => {
      screen.getByText('Set Logged In').click();
    });

    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('true');
  });

  test('generateTrackingCode returns a valid code', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    let trackingCode;
    act(() => {
      const { generateTrackingCode } = useApp();
      trackingCode = generateTrackingCode();
    });

    // Tracking code should be in format: VC-YYYYMMDD-XXXX
    expect(trackingCode).toMatch(/^VC-\d{8}-\d{4}$/);
  });
});