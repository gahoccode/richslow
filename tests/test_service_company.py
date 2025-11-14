"""Test company service functions with unit testing.

This module provides unit testing for company service functions,
focusing on data transformation, validation, and error handling
without external dependencies.
"""

from datetime import datetime
from unittest.mock import Mock, patch

import pytest
from pandas import DataFrame

from app.schemas.schema_company import (
    CompanyEventsTCBS,
    CompanyInsiderDeals,
    CompanyNews,
    CompanyOfficer,
    CompanyOverviewTCBS,
    CompanyProfile,
    CompanyRatioVCI,
    CompanyReportsVCI,
    CompanyShareholders,
    CompanySubsidiaries,
    DividendHistory,
    TradingStatsVCI,
)
from app.services.service_company import (
    get_company_dividends,
    get_company_events,
    get_company_insider_deals,
    get_company_news,
    get_company_officers,
    get_company_overview,
    get_company_profile,
    get_company_ratio_vci,
    get_company_reports_vci,
    get_company_shareholders,
    get_company_subsidiaries,
    get_company_trading_stats_vci,
)


class TestCompanyServiceFunctions:
    """Test company service functions for data processing and transformation."""

    @pytest.fixture
    def mock_overview_df(self):
        """Create mock overview DataFrame similar to vnstock response."""
        return DataFrame({
            'exchange': ['HOSE'],
            'industry': ['Utilities'],
            'company_type': ['CT'],
            'no_shareholders': [20147],
            'foreign_percent': [0.49],
            'outstanding_share': [541.7],
            'issue_share': [541.7],
            'established_year': ['2005'],
            'no_employees': [1939],
            'stock_rating': [3.3],
            'delta_in_week': [0.005],
            'delta_in_month': [0.098],
            'delta_in_year': [-0.129],
            'short_name': ['Refrigeration Electrical Engineering'],
            'website': ['https://www.reecorp.com'],
            'industry_id': [274],
            'industry_id_v2': ['7535'],
        })

    @pytest.fixture
    def mock_profile_df(self):
        """Create mock profile DataFrame similar to vnstock response."""
        return DataFrame({
            'company_name': ['Ngân hàng Thương mại Cổ phần Ngoại thương Việt Nam'],
            'company_profile': ['Ngân hàng TMCP Ngoại thương Việt Nam là một trong những ngân hàng lớn nhất Việt Nam.'],
            'history_dev': ['Tiền thân là Ngân hàng Ngoại thương Việt Nam được thành lập năm 1963.'],
            'company_promise': [None],
            'business_risk': ['Rủi ro từ biến động thị trường tài chính.'],
            'key_developments': ['Mở rộng mạng lưới, chuyển đổi số.'],
            'business_strategies': ['Tập trung vào bán lẻ và dịch vụ ngân hàng số.'],
        })

    @pytest.fixture
    def mock_shareholders_df(self):
        """Create mock shareholders DataFrame similar to vnstock response."""
        return DataFrame({
            'share_holder': ['Truong Gia Binh', 'FPT Series Fund LP', 'Nam A Commercial Joint Stock Bank'],
            'share_own_percent': [0.0689, 0.0523, 0.0487],
        })

    @pytest.fixture
    def mock_officers_df(self):
        """Create mock officers DataFrame similar to vnstock response."""
        return DataFrame({
            'officer_name': ['Truong Gia Binh', 'Bui Quang Ngoc', 'Nguyen Van Khoa'],
            'officer_position': ['Chairman of Management Board', 'Vice Chairman', 'Chief Executive Officer'],
            'officer_own_percent': [0.0689, 0.0234, 0.0156],
        })

    @pytest.fixture
    def mock_dividends_df(self):
        """Create mock dividends DataFrame similar to vnstock response."""
        return DataFrame({
            'exercise_date': ['2025-10-03', '2024-06-14', '2023-06-16'],
            'cash_year': [2024, 2023, 2022],
            'cash_dividend_percentage': [0.045, 0.040, 0.035],
            'issue_method': ['cash', 'cash', 'cash'],
        })

    @pytest.fixture
    def mock_events_df(self):
        """Create mock events DataFrame similar to vnstock response."""
        return DataFrame({
            'rsi': [44.5, 52.1, 48.3],
            'rs': [50.0, 45.0, 60.0],
            'id': [2603368, 2603125, 2602890],
            'price': [63900, 63500, 64200],
            'price_change': [400, -100, 300],
            'price_change_ratio': [0.006, -0.002, 0.005],
            'price_change_ratio_1m': [-0.014, 0.022, -0.008],
            'event_name': ['REE - Report Insider Transaction', 'REE - Public Release Q3 Financial Statement', 'REE - Dividend Payment'],
            'event_code': ['DDINS', 'BCTC', 'CKTT'],
            'notify_date': ['2025-11-11', '2025-11-08', '2025-10-28'],
            'exer_date': ['2025-11-11', '2025-11-08', '2025-10-03'],
            'reg_final_date': ['1753-01-01', '2025-10-25', '2025-09-20'],
            'exer_right_date': ['1753-01-01', '2025-10-15', '2025-09-10'],
            'event_desc': ['Insider transaction details for Platinum Victory Pte. Ltd.',
                          'Q3 2025 financial statement public release with revenue and profit figures.',
                          'Cash dividend payment for 2024 fiscal year.'],
        })

    @pytest.fixture
    def mock_news_df(self):
        """Create mock news DataFrame similar to vnstock response."""
        return DataFrame({
            'rsi': [28.1, 32.4, 41.2],
            'rs': [17.0, 25.0, 35.0],
            'price': [93000.0, 87000.0, 91200.0],
            'price_change': [6000.0, -2000.0, 1200.0],
            'price_change_ratio': [0.069, -0.022, 0.013],
            'price_change_ratio_1m': [-0.067, 0.045, -0.018],
            'id': [11592139, 11591824, 11591567],
            'title': ['FPT: Public release on 9M2025 financial highlights',
                     'FPT: Report on acquisition of new technology company',
                     'FPT: Announcement of strategic partnership with global cloud provider'],
            'source': ['TCBS', 'TCBS', 'TCBS'],
            'publish_date': ['2025-10-21 15:59:55', '2025-10-20 10:15:30', '2025-10-19 14:32:10'],
        })

    def test_get_company_overview_success(self, mock_overview_df):
        """Test successful company overview retrieval."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.overview.return_value = mock_overview_df
            mock_company_class.return_value = mock_company

            result = get_company_overview('REE')

            assert isinstance(result, CompanyOverviewTCBS)
            assert result.exchange == 'HOSE'
            assert result.industry == 'Utilities'
            assert result.company_type == 'CT'
            assert result.no_shareholders == 20147
            assert result.foreign_percent == 0.49
            assert result.outstanding_share == 541.7
            assert result.established_year == '2005'
            assert result.short_name == 'Refrigeration Electrical Engineering'
            assert result.website == 'https://www.reecorp.com'

    def test_get_company_overview_empty_data(self):
        """Test company overview with empty DataFrame."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.overview.return_value = DataFrame()
            mock_company_class.return_value = mock_company

            with pytest.raises(ValueError, match="No overview data found for ticker VCB"):
                get_company_overview('VCB')

    def test_get_company_overview_api_exception(self):
        """Test company overview with vnstock API exception."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company_class.side_effect = Exception("Network error")

            with pytest.raises(Exception, match="Failed to retrieve company overview for VCB"):
                get_company_overview('VCB')

    def test_get_company_profile_success(self, mock_profile_df):
        """Test successful company profile retrieval."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.profile.return_value = mock_profile_df
            mock_company_class.return_value = mock_company

            result = get_company_profile('VCB')

            assert isinstance(result, CompanyProfile)
            assert 'Ngân hàng Thương mại Cổ phần' in result.company_name
            assert 'Ngân hàng TMCP Ngoại thương Việt Nam' in result.company_profile
            assert result.company_promise is None
            assert result.business_risk == 'Rủi ro từ biến động thị trường tài chính.'

    def test_get_company_shareholders_success(self, mock_shareholders_df):
        """Test successful company shareholders retrieval."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.shareholders.return_value = mock_shareholders_df
            mock_company_class.return_value = mock_company

            result = get_company_shareholders('FPT')

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, CompanyShareholders) for item in result)
            assert result[0].share_holder == 'Truong Gia Binh'
            assert result[0].share_own_percent == 0.0689
            assert result[2].share_holder == 'Nam A Commercial Joint Stock Bank'
            assert result[2].share_own_percent == 0.0487

    def test_get_company_shareholders_empty_data(self):
        """Test company shareholders with empty DataFrame."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.shareholders.return_value = DataFrame()
            mock_company_class.return_value = mock_company

            result = get_company_shareholders('NEW')

            assert result == []

    def test_get_company_officers_success(self, mock_officers_df):
        """Test successful company officers retrieval."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.officers.return_value = mock_officers_df
            mock_company_class.return_value = mock_company

            result = get_company_officers('FPT')

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, CompanyOfficer) for item in result)
            assert result[0].officer_name == 'Truong Gia Binh'
            assert result[0].officer_position == 'Chairman of Management Board'
            assert result[0].officer_own_percent == 0.0689
            assert result[1].officer_position == 'Vice Chairman'  # All positions filled

    def test_get_company_dividends_success(self, mock_dividends_df):
        """Test successful company dividends retrieval."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.dividends.return_value = mock_dividends_df
            mock_company_class.return_value = mock_company

            result = get_company_dividends('VCB')

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, DividendHistory) for item in result)
            assert result[0].exercise_date == '2025-10-03'
            assert result[0].cash_year == 2024
            assert result[0].cash_dividend_percentage == 0.045
            assert result[0].issue_method == 'cash'
            assert result[2].issue_method == 'cash'

    def test_get_company_events_success(self, mock_events_df):
        """Test successful company events retrieval."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.events.return_value = mock_events_df
            mock_company_class.return_value = mock_company

            result = get_company_events('REE')

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, CompanyEventsTCBS) for item in result)
            assert result[0].rsi == 44.5
            assert result[0].id == 2603368
            assert result[0].price == 63900
            assert result[0].event_name == 'REE - Report Insider Transaction'
            assert result[0].notify_date == '2025-11-11'

    def test_get_company_news_success(self, mock_news_df):
        """Test successful company news retrieval."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.news.return_value = mock_news_df
            mock_company_class.return_value = mock_company

            result = get_company_news('FPT')

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, CompanyNews) for item in result)
            assert result[0].rsi == 28.1
            assert result[0].price == 93000.0
            assert 'FPT:' in result[0].title
            assert result[0].source == 'TCBS'
            assert result[0].publish_date == '2025-10-21 15:59:55'

    def test_get_company_subsidiaries_success(self):
        """Test successful company subsidiaries retrieval."""
        mock_data = DataFrame({
            'sub_company_name': [
                'Công ty TNHH Chứng khoán Ngân hàng Thương mại Ngoại thương Việt Nam',
                'Công Ty TNHH Một Thành Viên Kiều hối Ngân Hàng TMCP Ngoại thương Việt Nam',
            ],
            'sub_own_percent': [1.000, 1.000],
        })

        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.subsidiaries.return_value = mock_data
            mock_company_class.return_value = mock_company

            result = get_company_subsidiaries('VCB')

            assert isinstance(result, list)
            assert len(result) == 2
            assert all(isinstance(item, CompanySubsidiaries) for item in result)
            assert 'Chứng khoán' in result[0].sub_company_name
            assert result[0].sub_own_percent == 1.000

    def test_get_company_insider_deals_success(self):
        """Test successful company insider deals retrieval."""
        mock_data = DataFrame({
            'deal_announce_date': [datetime(2023, 12, 21), datetime(2020, 12, 30)],
            'deal_method': [None, None],
            'deal_action': ['Mua', 'Bán'],
            'deal_quantity': [5000.0, -2523.0],
            'deal_price': [80900.0, 64175.0],
            'deal_ratio': [0.115, 0.406],
        })

        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.insider_deals.return_value = mock_data
            mock_company_class.return_value = mock_company

            result = get_company_insider_deals('VCB')

            assert isinstance(result, list)
            assert len(result) == 2
            assert all(isinstance(item, CompanyInsiderDeals) for item in result)
            assert result[0].deal_action == 'Mua'
            assert result[0].deal_method is None
            assert result[0].deal_quantity == 5000.0

    def test_get_company_ratio_vci_success(self):
        """Test successful company financial ratios retrieval."""
        mock_data = DataFrame({
            'symbol': ['REE', 'REE'],
            'year_report': [2025, 2024],
            'length_report': [3, 4],
            'update_date': [1761844502673, 1714834502673],
            'revenue': [2555163684559, 2032156789123],
            'revenue_growth': [0.2578564391219565, 0.1823456789012345],
            'net_profit': [674227109814, 479516789456],
            'net_profit_growth': [0.4050917229112621, 0.3451234567890123],
            'ebit_margin': [0, 0],
            'roe': [0.1320102898, 0.1182345678901234],
            'roic': [0, 0],
            'roa': [0.0696638967, 0.0623456789012345],
            'pe': [13.7777569513, 15.2345678901234],
            'pb': [1.7534369022, 1.9234567890123],
            'eps': [1244.746568488284, 885.1234567890123],
            'current_ratio': [2, 2],
            'cash_ratio': [1, 1],
            'quick_ratio': [2, 2],
            'interest_coverage': ['-4.338824653274593', '-3.1234567890123456'],
            'ae': [1.5835287711515749, 1.4234567890123456],
            'fae': [0.5953429887060038, 0.5234567890123456],
            'net_profit_margin': [0.2641787715072509, 0.23612345678901234],
            'gross_margin': [0, 0],
            'ev': [35641105546200, 28912345678901],
            'issue_share': [541658139, 541658139],
            'ps': [3.7637373037, 3.4234567890123456],
            'pcf': [13.5397647824, 14.623456789012345],
            'bvps': [20000.0, 18500.0],
            'ev_per_ebitda': [8, 9],
            'at': [400000000, 380000000],
            'fat': [350000000, 330000000],
            'acp': [None, None],
            'dso': [45, 48],
            'dpo': [60, 65],
            'eps_ttm': [3400.0, 3100.0],
            'charter_capital': [30000000, 28000000],
            'rtq4': [85000, 82000],
            'charter_capital_ratio': [0.2, 0.19],
            'rtq10': [88000, 85000],
            'dividend': [1500, 1400],
            'ebitda': [80000000, 75000000],
            'ebit': [60000000, 55000000],
            'le': [200000000, 180000000],
            'de': [100000000, 90000000],
            'ccc': [None, None],
            'rtq17': [82000, 79000],
        })

        with patch('app.services.service_company.VCICompany') as mock_company_class:
            mock_company = Mock()
            mock_company.ratio_summary.return_value = mock_data
            mock_company_class.return_value = mock_company

            result = get_company_ratio_vci('REE')

            assert isinstance(result, list)
            assert len(result) == 2
            assert all(isinstance(item, CompanyRatioVCI) for item in result)
            assert result[0].symbol == 'REE'
            assert result[0].year_report == 2025
            assert result[0].roe == 0.1320102898
            assert result[0].interest_coverage == '-4.338824653274593'

    def test_get_company_reports_vci_success(self):
        """Test successful company reports retrieval."""
        mock_data = DataFrame({
            'date': ['2024-03-15', '2023-12-20'],
            'description': ['Báo cáo tài chính quý 1/2024', 'Báo cáo tài chính năm 2023'],
            'link': ['https://example.com/q1_2024.pdf', 'https://example.com/annual_2023.pdf'],
            'name': ['Q1_2024_Financial_Report.pdf', 'Annual_2023_Financial_Report.pdf'],
        })

        with patch('app.services.service_company.VCICompany') as mock_company_class:
            mock_company = Mock()
            mock_company.reports.return_value = mock_data
            mock_company_class.return_value = mock_company

            result = get_company_reports_vci('VCB')

            assert isinstance(result, list)
            assert len(result) == 2
            assert all(isinstance(item, CompanyReportsVCI) for item in result)
            assert result[0].description == 'Báo cáo tài chính quý 1/2024'
            assert result[0].link == 'https://example.com/q1_2024.pdf'

    def test_get_company_trading_stats_vci_success(self):
        """Test successful company trading statistics retrieval."""
        mock_data = DataFrame({
            'symbol': ['VCB'],
            'exchange': ['HOSE'],
            'ev': [5000000000],
            'ceiling': [95000],
            'floor': [85000],
            'foreign_room': [1000000],
            'avg_match_volume_2w': [5000000],
            'foreign_holding_room': [300000],
            'current_holding_ratio': [0.25],
            'max_holding_ratio': [0.49],
        })

        with patch('app.services.service_company.VCICompany') as mock_company_class:
            mock_company = Mock()
            mock_company.trading_stats.return_value = mock_data
            mock_company_class.return_value = mock_company

            result = get_company_trading_stats_vci('VCB')

            assert isinstance(result, TradingStatsVCI)
            assert result.symbol == 'VCB'
            assert result.exchange == 'HOSE'
            assert result.ceiling == 95000
            assert result.floor == 85000
            assert result.current_holding_ratio == 0.25
            assert result.max_holding_ratio == 0.49

    def test_get_company_trading_stats_vci_empty_data(self):
        """Test company trading statistics with empty DataFrame."""
        with patch('app.services.service_company.VCICompany') as mock_company_class:
            mock_company = Mock()
            mock_company.trading_stats.return_value = DataFrame()
            mock_company_class.return_value = mock_company

            with pytest.raises(ValueError, match="No trading statistics found for ticker VCB"):
                get_company_trading_stats_vci('VCB')

    @pytest.mark.parametrize("ticker", ["FPT", "HPG", "ACB", "MWG"])
    def test_multiple_tickers_overview(self, ticker, mock_overview_df):
        """Test company overview with different tickers."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.overview.return_value = mock_overview_df
            mock_company_class.return_value = mock_company

            result = get_company_overview(ticker)

            assert isinstance(result, CompanyOverviewTCBS)
            assert result.exchange == 'HOSE'

    def test_data_type_handling_edge_cases(self):
        """Test edge cases for data type handling in service functions."""
        # Test with None values and missing data
        mock_df_with_missing = DataFrame({
            'exchange': ['HOSE'],
            'industry': [None],  # None value
            'company_type': ['NH'],
            'no_shareholders': [25183],
            'foreign_percent': [None],  # None value
            'outstanding_share': [None],  # None value
            'issue_share': [0.0],
            'established_year': [''],  # Empty string
            'no_employees': [40000],
            'stock_rating': [None],  # None value
            'delta_in_week': [None],  # None value
            'delta_in_month': [-0.036],
            'delta_in_year': [0.15],
            'short_name': ['Vietcombank'],
            'website': [''],
            'industry_id': [None],  # None value
            'industry_id_v2': [None],  # None value
        })

        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.overview.return_value = mock_df_with_missing
            mock_company_class.return_value = mock_company

            result = get_company_overview('VCB')

            assert result.industry == ''  # None should be converted to empty string
            assert result.foreign_percent == 0.0  # None should be converted to 0.0
            assert result.outstanding_share == 0.0  # None should be converted to 0.0
            assert result.established_year == ''  # Empty string preserved
            assert result.stock_rating == 0.0  # None should be converted to 0.0
            assert result.delta_in_week == 0.0  # None should be converted to 0.0
            assert result.website == ''  # Empty string preserved
            assert result.industry_id == 0  # None should be converted to 0
            assert result.industry_id_v2 == ''  # None should be converted to empty string