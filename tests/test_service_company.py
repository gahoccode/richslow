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
            'industry': ['Ngân hàng'],
            'company_type': ['NH'],
            'no_shareholders': [25183],
            'foreign_percent': [0.235],
            'outstanding_share': [5589.1],
            'issue_share': [0.0],
            'established_year': ['2008'],
            'no_employees': [40000],
            'stock_rating': [8.5],
            'delta_in_week': [-0.071],
            'delta_in_month': [-0.036],
            'delta_in_year': [0.15],
            'short_name': ['Vietcombank'],
            'website': ['https://vietcombank.com.vn'],
            'industry_id': [289],
            'industry_id_v2': ['8355'],
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
            'share_holder': ['Ngân Hàng Nhà Nước Việt Nam', 'Mizuho Bank Limited', 'Khác'],
            'share_own_percent': [0.7480, 0.1500, 0.0295],
        })

    @pytest.fixture
    def mock_officers_df(self):
        """Create mock officers DataFrame similar to vnstock response."""
        return DataFrame({
            'officer_name': ['Nguyễn Thanh Tùng', 'Đàm Lam Thanh', 'Phạm Văn Thiết'],
            'officer_position': ['Tổng Giám đốc', None, 'Thành viên HĐQT'],
            'officer_own_percent': [0.0, 0.0, 0.001],
        })

    @pytest.fixture
    def mock_dividends_df(self):
        """Create mock dividends DataFrame similar to vnstock response."""
        return DataFrame({
            'exercise_date': ['25/07/23', '22/12/21', '22/12/21'],
            'cash_year': [2023, 2022, 2020],
            'cash_dividend_percentage': [0.181, 0.276, 0.120],
            'issue_method': ['share', 'share', 'cash'],
        })

    @pytest.fixture
    def mock_events_df(self):
        """Create mock events DataFrame similar to vnstock response."""
        return DataFrame({
            'rsi': [56.4, 52.0, 45.5],
            'rs': [54.0, 61.0, 70.0],
            'id': [2566332, 2564026, 2563891],
            'price': [94400, 89100, 86300],
            'price_change': [300, 0, -2100],
            'price_change_ratio': [0.003, 0.000, -0.024],
            'price_change_ratio_1m': [-0.028, 0.000, 0.076],
            'event_name': ['Đại hội đồng cổ đông', 'Đại hội đồng cổ đông', 'Đại hội đồng cổ đông thường niên'],
            'event_code': ['DHCĐ', 'DHCĐ', 'DHCĐ'],
            'notify_date': ['2024-03-12 00:00:00', '2023-08-31 00:00:00', '2023-08-23 00:00:00'],
            'exer_date': ['2024-04-27 00:00:00', '2023-08-30 00:00:00', '2023-10-06 00:00:00'],
            'reg_final_date': ['2024-03-27 00:00:00', '1753-01-01 00:00:00', '2023-09-05 00:00:00'],
            'exer_right_date': ['2024-03-26 00:00:00', '1753-01-01 00:00:00', '2023-08-31 00:00:00'],
            'event_desc': ['Ngân hàng TMCP Ngoại thương Việt Nam tổ chức ĐHĐCĐ thường niên năm 2024.',
                          'Ngân hàng TMCP Ngoại thương Việt Nam tổ chức ĐHĐCĐ bất thường năm 2023.',
                          'Ngân hàng TMCP Ngoại thương Việt Nam tổ chức ĐHĐCĐ thường niên năm 2023.'],
        })

    @pytest.fixture
    def mock_news_df(self):
        """Create mock news DataFrame similar to vnstock response."""
        return DataFrame({
            'rsi': [41.4, 40.1, 35.4],
            'rs': [50.0, 49.0, 57.0],
            'price': [91900.0, 91200.0, 90600.0],
            'price_change': [700.0, 200.0, 0.0],
            'price_change_ratio': [0.008, 0.002, 0.000],
            'price_change_ratio_1m': [-0.028, -0.053, -0.022],
            'id': [11170634, 11168477, 11158655],
            'title': ['VCB: Công bố đường dẫn BCTC riêng và HN Q1/2024',
                     'VCB: Cập nhật, bổ sung tài liệu họp ĐHĐCĐ',
                     'VCB: Báo cáo tài chính Năm (Kỳ báo cáo từ 01/01/2023 đến 31/12/2023)'],
            'source': ['TCBS', 'TCBS', 'TCBS'],
            'publish_date': ['2024-05-02 15:53:00', '2024-04-26 16:56:00', '2024-04-19 09:58:00'],
        })

    def test_get_company_overview_success(self, mock_overview_df):
        """Test successful company overview retrieval."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.overview.return_value = mock_overview_df
            mock_company_class.return_value = mock_company

            result = get_company_overview('VCB')

            assert isinstance(result, CompanyOverviewTCBS)
            assert result.exchange == 'HOSE'
            assert result.industry == 'Ngân hàng'
            assert result.company_type == 'NH'
            assert result.no_shareholders == 25183
            assert result.foreign_percent == 0.235
            assert result.outstanding_share == 5589.1
            assert result.established_year == '2008'
            assert result.short_name == 'Vietcombank'
            assert result.website == 'https://vietcombank.com.vn'

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

            result = get_company_shareholders('VCB')

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, CompanyShareholders) for item in result)
            assert result[0].share_holder == 'Ngân Hàng Nhà Nước Việt Nam'
            assert result[0].share_own_percent == 0.7480
            assert result[2].share_holder == 'Khác'
            assert result[2].share_own_percent == 0.0295

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

            result = get_company_officers('VCB')

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, CompanyOfficer) for item in result)
            assert result[0].officer_name == 'Nguyễn Thanh Tùng'
            assert result[0].officer_position == 'Tổng Giám đốc'
            assert result[0].officer_own_percent == 0.0
            assert result[1].officer_position is None  # None handling

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
            assert result[0].exercise_date == '25/07/23'
            assert result[0].cash_year == 2023
            assert result[0].cash_dividend_percentage == 0.181
            assert result[0].issue_method == 'share'
            assert result[2].issue_method == 'cash'

    def test_get_company_events_success(self, mock_events_df):
        """Test successful company events retrieval."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.events.return_value = mock_events_df
            mock_company_class.return_value = mock_company

            result = get_company_events('VCB')

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, CompanyEventsTCBS) for item in result)
            assert result[0].rsi == 56.4
            assert result[0].id == 2566332
            assert result[0].price == 94400
            assert result[0].event_name == 'Đại hội đồng cổ đông'
            assert result[0].notify_date == '2024-03-12 00:00:00'

    def test_get_company_news_success(self, mock_news_df):
        """Test successful company news retrieval."""
        with patch('app.services.service_company.TCBSCompany') as mock_company_class:
            mock_company = Mock()
            mock_company.news.return_value = mock_news_df
            mock_company_class.return_value = mock_company

            result = get_company_news('VCB')

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, CompanyNews) for item in result)
            assert result[0].rsi == 41.4
            assert result[0].price == 91900.0
            assert 'VCB:' in result[0].title
            assert result[0].source == 'TCBS'
            assert result[0].publish_date == '2024-05-02 15:53:00'

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
            'symbol': ['VCB', 'VCB'],
            'year_report': [2023, 2022],
            'length_report': [12, 12],
            'update_date': [20240315, 20230315],
            'revenue': [150000000, 130000000],
            'revenue_growth': [0.15, 0.12],
            'net_profit': [50000000, 45000000],
            'net_profit_growth': [0.11, 0.10],
            'ebit_margin': [33, 35],
            'roe': [0.18, 0.20],
            'roic': [25, 22],
            'roa': [0.12, 0.15],
            'pe': [15.5, 14.2],
            'pb': [1.8, 1.6],
            'eps': [3500.0, 3200.0],
            'current_ratio': [1.5, 1.6],
            'cash_ratio': [0.8, 0.9],
            'quick_ratio': [1.2, 1.3],
            'interest_coverage': [None, None],
            'ae': [20000000, 18000000],
            'fae': [18000000, 16000000],
            'net_profit_margin': [0.33, 0.35],
            'gross_margin': [45, 47],
            'ev': [5000000000, 4500000000],
            'issue_share': [1000000, 950000],
            'ps': [2.5, 2.3],
            'pcf': [12.0, 11.5],
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

            result = get_company_ratio_vci('VCB')

            assert isinstance(result, list)
            assert len(result) == 2
            assert all(isinstance(item, CompanyRatioVCI) for item in result)
            assert result[0].symbol == 'VCB'
            assert result[0].year_report == 2023
            assert result[0].roe == 0.18
            assert result[0].interest_coverage is None

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