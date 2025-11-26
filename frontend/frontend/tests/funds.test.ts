/**
 * Tests for funds functionality including component rendering, API integration, and user interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { FundsSection } from '../components/market/FundsSection';

// Mock the API facade
jest.mock('../lib/api/facade', () => ({
  default: {
    funds: {
      getListing: jest.fn(),
      getNavReport: jest.fn(),
      getTopHoldings: jest.fn(),
      getIndustryAllocation: jest.fn(),
      getAssetAllocation: jest.fn(),
    },
  },
}));

// Mock shadcn components
jest.mock('../components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
}));

jest.mock('../components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table data-testid="table">{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody data-testid="table-body">{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td data-testid="table-cell">{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th data-testid="table-head">{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead data-testid="table-header">{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr data-testid="table-row">{children}</tr>,
}));

jest.mock('../components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('../components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock('../components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className}></div>,
}));

jest.mock('../components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button data-testid="tabs-trigger">{children}</button>,
}));

jest.mock('../components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogTrigger: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
}));

import api from '../lib/api/facade';

const mockFundsListing = [
  {
    fund_id: 1,
    short_name: 'VCBF-BCF',
    fund_type: 'BALANCED',
    nav: 42555.42,
    nav_change_1d: 0.001,
    nav_change_1w: 0.005,
    nav_change_1m: 0.025,
    nav_change_1y: 0.15,
    fund_ownership: 0.85,
    management_fee: 0.015,
    issue_date: '2014-01-15',
    nav_change_3m: null,
    nav_change_6m: null,
    nav_change_2y: null,
    nav_change_3y: null,
    nav_change_1y_annualized: null,
    nav_change_2y_annualized: null,
    nav_change_3y_annualized: null,
    nav_change_12m_annualized: null,
    nav_change_24m_annualized: null,
    nav_change_36m_annualized: null,
  },
  {
    fund_id: 2,
    short_name: 'DCDS',
    fund_type: 'STOCK',
    nav: 103152.84,
    nav_change_1d: -0.005,
    nav_change_1w: 0.01,
    nav_change_1m: 0.08,
    nav_change_1y: 0.22,
    fund_ownership: 0.90,
    management_fee: 0.02,
    issue_date: '2018-03-20',
    nav_change_3m: null,
    nav_change_6m: null,
    nav_change_2y: null,
    nav_change_3y: null,
    nav_change_1y_annualized: null,
    nav_change_2y_annualized: null,
    nav_change_3y_annualized: null,
    nav_change_12m_annualized: null,
    nav_change_24m_annualized: null,
    nav_change_36m_annualized: null,
  },
  {
    fund_id: 3,
    short_name: 'VFF',
    fund_type: 'BOND',
    nav: 11500.00,
    nav_change_1d: 0.0001,
    nav_change_1w: 0.0005,
    nav_change_1m: 0.002,
    nav_change_1y: 0.045,
    fund_ownership: 0.95,
    management_fee: 0.01,
    issue_date: '2016-06-10',
    nav_change_3m: null,
    nav_change_6m: null,
    nav_change_2y: null,
    nav_change_3y: null,
    nav_change_1y_annualized: null,
    nav_change_2y_annualized: null,
    nav_change_3y_annualized: null,
    nav_change_12m_annualized: null,
    nav_change_24m_annualized: null,
    nav_change_36m_annualized: null,
  },
];

const mockFundDetails = {
  navReport: [
    { nav_date: '2024-01-15', nav_per_unit: 42555.42, fund_id: 1 },
    { nav_date: '2024-01-14', nav_per_unit: 42513.48, fund_id: 1 },
    { nav_date: '2024-01-13', nav_per_unit: 42471.54, fund_id: 1 },
  ],
  topHoldings: [
    { code: 'MBB', industry: 'Ngân hàng', percent_asset: 7.9, update_date: '2024-01-15', fund_id: 1 },
    { code: 'FPT', industry: 'Công nghệ và thông tin', percent_asset: 6.23, update_date: '2024-01-15', fund_id: 1 },
    { code: 'HPG', industry: 'Vật liệu xây dựng', percent_asset: 5.6, update_date: '2024-01-15', fund_id: 1 },
  ],
  industryAllocation: [
    { industry: 'Ngân hàng', percent_asset: 30.32 },
    { industry: 'Thực phẩm - Đồ uống', percent_asset: 8.85 },
    { industry: 'Bất động sản', percent_asset: 8.43 },
  ],
  assetAllocation: [
    { asset_type: 'Cổ phiếu', percent_asset: 90.36 },
    { asset_type: 'Tiền và tương đương tiền', percent_asset: 9.37 },
    { asset_type: 'Khác', percent_asset: 0.27 },
  ],
};

describe('FundsSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state correctly', () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<FundsSection loading={true} />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toHaveTextContent('Vietnamese Mutual Funds');
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6); // 1 header + 5 rows
  });

  test('renders error state correctly', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockRejectedValue(new Error('API Error'));

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
    });
  });

  test('renders funds list correctly', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue(mockFundsListing);

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('VCBF-BCF')).toBeInTheDocument();
      expect(screen.getByText('DCDS')).toBeInTheDocument();
      expect(screen.getByText('VFF')).toBeInTheDocument();
    });

    // Check fund type badges
    expect(screen.getByText('Balanced')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Bond')).toBeInTheDocument();

    // Check filter buttons
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Bond')).toBeInTheDocument();
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  test('displays NAV values with correct formatting', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue(mockFundsListing);

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('42.555,42₫')).toBeInTheDocument(); // VCBF-BCF NAV
      expect(screen.getByText('103.153,84₫')).toBeInTheDocument(); // DCDS NAV
    });
  });

  test('displays percentage changes with correct colors', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue(mockFundsListing);

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      const positiveChanges = screen.getAllByText((text) => text.includes('2.50%'));
      const negativeChanges = screen.getAllByText((text) => text.includes('0.50%'));

      expect(positiveChanges.length).toBeGreaterThan(0);
      expect(negativeChanges.length).toBeGreaterThan(0);
    });
  });

  test('filters funds by type correctly', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing
      .mockResolvedValueOnce(mockFundsListing) // Initial load
      .mockResolvedValueOnce([mockFundsListing[1]]) // Stock filter
      .mockResolvedValueOnce([mockFundsListing[2]]) // Bond filter
      .mockResolvedValueOnce([mockFundsListing[0]]); // Balanced filter

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('VCBF-BCF')).toBeInTheDocument();
      expect(screen.getByText('DCDS')).toBeInTheDocument();
      expect(screen.getByText('VFF')).toBeInTheDocument();
    });

    // Test stock filter
    const stockFilter = screen.getByText('Stock');
    fireEvent.click(stockFilter);

    await waitFor(() => {
      expect(mockApi.getListing).toHaveBeenCalledWith('STOCK');
    });

    // Test bond filter
    const bondFilter = screen.getByText('Bond');
    fireEvent.click(bondFilter);

    await waitFor(() => {
      expect(mockApi.getListing).toHaveBeenCalledWith('BOND');
    });

    // Test balanced filter
    const balancedFilter = screen.getByText('Balanced');
    fireEvent.click(balancedFilter);

    await waitFor(() => {
      expect(mockApi.getListing).toHaveBeenCalledWith('BALANCED');
    });

    // Test all filter
    const allFilter = screen.getByText('All');
    fireEvent.click(allFilter);

    await waitFor(() => {
      expect(mockApi.getListing).toHaveBeenCalledWith(undefined);
    });
  });

  test('opens fund details dialog and loads data', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue(mockFundsListing);
    mockApi.getNavReport.mockResolvedValue(mockFundDetails.navReport);
    mockApi.getTopHoldings.mockResolvedValue(mockFundDetails.topHoldings);
    mockApi.getIndustryAllocation.mockResolvedValue(mockFundDetails.industryAllocation);
    mockApi.getAssetAllocation.mockResolvedValue(mockFundDetails.assetAllocation);

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('VCBF-BCF')).toBeInTheDocument();
    });

    // Click "View Details" button for the first fund
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    await waitFor(() => {
      expect(mockApi.getNavReport).toHaveBeenCalledWith('VCBF-BCF');
      expect(mockApi.getTopHoldings).toHaveBeenCalledWith('VCBF-BCF');
      expect(mockApi.getIndustryAllocation).toHaveBeenCalledWith('VCBF-BCF');
      expect(mockApi.getAssetAllocation).toHaveBeenCalledWith('VCBF-BCF');
    });
  });

  test('renders fund details tabs correctly', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue(mockFundsListing);
    mockApi.getNavReport.mockResolvedValue(mockFundDetails.navReport);
    mockApi.getTopHoldings.mockResolvedValue(mockFundDetails.topHoldings);
    mockApi.getIndustryAllocation.mockResolvedValue(mockFundDetails.industryAllocation);
    mockApi.getAssetAllocation.mockResolvedValue(mockFundDetails.assetAllocation);

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('VCBF-BCF')).toBeInTheDocument();
    });

    // Click "View Details" button
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Top Holdings')).toBeInTheDocument();
      expect(screen.getByText('Industry')).toBeInTheDocument();
      expect(screen.getByText('Assets')).toBeInTheDocument();
      expect(screen.getByText('NAV History')).toBeInTheDocument();
    });
  });

  test('displays holdings data correctly in details dialog', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue(mockFundsListing);
    mockApi.getTopHoldings.mockResolvedValue(mockFundDetails.topHoldings);

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('VCBF-BCF')).toBeInTheDocument();
    });

    // Click "View Details" button
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('MBB')).toBeInTheDocument();
      expect(screen.getByText('FPT')).toBeInTheDocument();
      expect(screen.getByText('HPG')).toBeInTheDocument();
      expect(screen.getByText('Ngân hàng')).toBeInTheDocument();
      expect(screen.getByText('7.90%')).toBeInTheDocument();
    });
  });

  test('displays allocation data correctly in details dialog', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue(mockFundsListing);
    mockApi.getIndustryAllocation.mockResolvedValue(mockFundDetails.industryAllocation);
    mockApi.getAssetAllocation.mockResolvedValue(mockFundDetails.assetAllocation);

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('VCBF-BCF')).toBeInTheDocument();
    });

    // Click "View Details" button
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Ngân hàng')).toBeInTheDocument();
      expect(screen.getByText('30.32%')).toBeInTheDocument();
      expect(screen.getByText('Cổ phiếu')).toBeInTheDocument();
      expect(screen.getByText('90.36%')).toBeInTheDocument();
    });
  });

  test('handles empty funds list correctly', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue([]);

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('No funds found for the selected criteria.')).toBeInTheDocument();
    });
  });

  test('handles fund details loading error gracefully', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue(mockFundsListing);
    mockApi.getNavReport.mockRejectedValue(new Error('Failed to load NAV'));
    mockApi.getTopHoldings.mockRejectedValue(new Error('Failed to load holdings'));
    mockApi.getIndustryAllocation.mockRejectedValue(new Error('Failed to load industry'));
    mockApi.getAssetAllocation.mockRejectedValue(new Error('Failed to load assets'));

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('VCBF-BCF')).toBeInTheDocument();
    });

    // Click "View Details" button
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    // Should not crash, just show empty state
    await waitFor(() => {
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });
  });

  test('external loading prop controls loading state', () => {
    render(<FundsSection loading={true} />);

    expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
  });

  test('formats Vietnamese fund types correctly', async () => {
    const mockApi = api.funds as any;
    const fundsWithVietnameseTypes = [
      {
        ...mockFundsListing[0],
        fund_type: 'Quỹ cân bằng',
      },
      {
        ...mockFundsListing[1],
        fund_type: 'Quỹ cổ phiếu',
      },
      {
        ...mockFundsListing[2],
        fund_type: 'Quỹ trái phiếu',
      },
    ];

    mockApi.getListing.mockResolvedValue(fundsWithVietnameseTypes);

    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('Balanced')).toBeInTheDocument();
      expect(screen.getByText('Stock')).toBeInTheDocument();
      expect(screen.getByText('Bond')).toBeInTheDocument();
    });
  });
});

describe('Funds API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getListing API call with parameters', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue([]);

    // Import the component to trigger API calls
    const { FundsSection } = require('../components/market/FundsSection');
    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(mockApi.getListing).toHaveBeenCalledWith(undefined);
    });
  });

  test('search API call with symbol', async () => {
    const mockApi = api.funds as any;
    mockApi.searchFunds.mockResolvedValue([]);

    await mockApi.searchFunds('VCBF');

    expect(mockApi.searchFunds).toHaveBeenCalledWith('VCBF');
  });

  test('all fund detail endpoints called with correct symbol', async () => {
    const mockApi = api.funds as any;
    mockApi.getListing.mockResolvedValue(mockFundsListing);
    mockApi.getNavReport.mockResolvedValue([]);
    mockApi.getTopHoldings.mockResolvedValue([]);
    mockApi.getIndustryAllocation.mockResolvedValue([]);
    mockApi.getAssetAllocation.mockResolvedValue([]);

    const { FundsSection } = require('../components/market/FundsSection');
    render(<FundsSection loading={false} />);

    await waitFor(() => {
      expect(screen.getByText('VCBF-BCF')).toBeInTheDocument();
    });

    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]);

    await waitFor(() => {
      expect(mockApi.getNavReport).toHaveBeenCalledWith('VCBF-BCF');
      expect(mockApi.getTopHoldings).toHaveBeenCalledWith('VCBF-BCF');
      expect(mockApi.getIndustryAllocation).toHaveBeenCalledWith('VCBF-BCF');
      expect(mockApi.getAssetAllocation).toHaveBeenCalledWith('VCBF-BCF');
    });
  });
});