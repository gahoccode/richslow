"""
RichSlow Financial Statements Viewer - Streamlit Demo App

This Streamlit application demonstrates the reusability of the RichSlow API
by querying the financial statements endpoint and displaying comprehensive
financial data for Vietnamese stocks.

Installation:
    pip install streamlit requests
    # OR
    uv pip install streamlit requests

Usage:
    1. Start the FastAPI server:
       uv run uvicorn app.main:app --reload

    2. Run this Streamlit app (in a new terminal):
       streamlit run streamlit.py

    3. Open your browser at http://localhost:8501

Requirements:
    - RichSlow API server running at http://localhost:8000
    - Streamlit, requests, pandas (pandas is already in project dependencies)
"""

from datetime import date, timedelta
from typing import Any

import pandas as pd
import requests
import streamlit as st

# API Configuration
API_BASE_URL = "http://localhost:8000"


def fetch_financial_data(
    ticker: str, start_date: str, end_date: str, period: str
) -> dict[str, Any] | None:
    """
    Fetch financial statements data from the RichSlow API.

    Args:
        ticker: Stock ticker symbol (e.g., 'FPT', 'VCB')
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        period: Analysis period ('year' or 'quarter')

    Returns:
        API response as dictionary containing financial statements, or None if error

    Raises:
        requests.exceptions.RequestException: If API request fails
    """
    url = f"{API_BASE_URL}/api/statements/{ticker}"
    params = {"start_date": start_date, "end_date": end_date, "period": period}

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if response.status_code == 400:
            st.error(f"Invalid request: {response.json().get('detail', str(e))}")
        elif response.status_code == 500:
            st.error(
                f"Server error: {response.json().get('detail', 'Internal server error')}"
            )
        else:
            st.error(f"HTTP error occurred: {e}")
        return None
    except requests.exceptions.ConnectionError:
        st.error(
            f"Cannot connect to API server at {API_BASE_URL}. "
            "Please ensure the FastAPI server is running."
        )
        return None
    except requests.exceptions.Timeout:
        st.error("Request timed out. Please try again.")
        return None
    except requests.exceptions.RequestException as e:
        st.error(f"An error occurred: {e}")
        return None


def main() -> None:
    """Main Streamlit application."""
    # Page configuration
    st.set_page_config(
        page_title="RichSlow Financial Viewer",
        page_icon="📊",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    # Title and description
    st.title("📊 RichSlow Financial Statements Viewer")
    st.markdown(
        """
        This app demonstrates the **reusability of the RichSlow API** by querying
        financial statements for Vietnamese stocks and displaying comprehensive data.
        """
    )

    # Sidebar - Input Form
    with st.sidebar:
        st.header("Query Parameters")

        # Ticker input
        ticker = st.text_input(
            "Stock Ticker Symbol",
            value="FPT",
            max_chars=10,
            help="Enter a Vietnamese stock ticker (e.g., FPT, VCB, HPG)",
        ).upper()

        # Date range inputs
        st.subheader("Date Range")
        default_start = date.today() - timedelta(days=3 * 365)  # 3 years ago
        default_end = date.today()

        start_date = st.date_input(
            "Start Date",
            value=default_start,
            max_value=date.today(),
            help="Select the start date for financial data",
        )

        end_date = st.date_input(
            "End Date",
            value=default_end,
            max_value=date.today(),
            help="Select the end date for financial data",
        )

        # Period selection
        period = st.radio(
            "Analysis Period",
            options=["year", "quarter"],
            index=0,
            help="Select yearly or quarterly financial reports",
        )

        # Fetch button
        fetch_button = st.button(
            "🔍 Fetch Financial Data", type="primary", use_container_width=True
        )

        # Validation
        if ticker and len(ticker.strip()) == 0:
            st.warning("⚠️ Please enter a valid ticker symbol")

        if start_date >= end_date:
            st.error("❌ Start date must be before end date")

    # Main content area
    if fetch_button:
        if not ticker or len(ticker.strip()) == 0:
            st.error("Please enter a ticker symbol in the sidebar")
            return

        if start_date >= end_date:
            st.error("Start date must be before end date")
            return

        # Show query info
        st.info(
            f"📈 Querying **{ticker}** from {start_date} to {end_date} ({period}ly reports)"
        )

        # Fetch data with loading spinner
        with st.spinner("Fetching financial data from API..."):
            data = fetch_financial_data(
                ticker=ticker,
                start_date=str(start_date),
                end_date=str(end_date),
                period=period,
            )

        if data is None:
            st.warning("No data retrieved. Please check the error messages above.")
            return

        # Display success message
        st.success(
            f"✅ Successfully retrieved data for {data.get('ticker')} "
            f"({len(data.get('years', []))} years)"
        )

        # Create tabs for different financial statements
        tab1, tab2, tab3, tab4 = st.tabs(
            [
                "📊 Income Statement",
                "💰 Balance Sheet",
                "💸 Cash Flow",
                "📈 Financial Ratios",
            ]
        )

        # Tab 1: Income Statement
        with tab1:
            st.subheader("Income Statement")
            income_statements = data.get("income_statements", [])

            if income_statements:
                df_income = pd.DataFrame(income_statements)
                st.dataframe(
                    df_income,
                    use_container_width=True,
                    hide_index=True,
                )
                st.caption(f"Showing {len(df_income)} income statement records")
            else:
                st.info("No income statement data available for the selected period")

        # Tab 2: Balance Sheet
        with tab2:
            st.subheader("Balance Sheet")
            balance_sheets = data.get("balance_sheets", [])

            if balance_sheets:
                df_balance = pd.DataFrame(balance_sheets)
                st.dataframe(
                    df_balance,
                    use_container_width=True,
                    hide_index=True,
                )
                st.caption(f"Showing {len(df_balance)} balance sheet records")
            else:
                st.info("No balance sheet data available for the selected period")

        # Tab 3: Cash Flow
        with tab3:
            st.subheader("Cash Flow Statement")
            cash_flows = data.get("cash_flows", [])

            if cash_flows:
                df_cashflow = pd.DataFrame(cash_flows)
                st.dataframe(
                    df_cashflow,
                    use_container_width=True,
                    hide_index=True,
                )
                st.caption(f"Showing {len(df_cashflow)} cash flow records")
            else:
                st.info("No cash flow data available for the selected period")

        # Tab 4: Financial Ratios
        with tab4:
            st.subheader("Financial Ratios")
            ratios = data.get("ratios", [])

            if ratios:
                df_ratios = pd.DataFrame(ratios)
                st.dataframe(
                    df_ratios,
                    use_container_width=True,
                    hide_index=True,
                )
                st.caption(f"Showing {len(df_ratios)} ratio records")

                # Show available years
                if "years" in data:
                    st.info(f"📅 Available years: {', '.join(map(str, data['years']))}")
            else:
                st.info("No financial ratio data available for the selected period")

    else:
        # Initial state - show instructions
        st.markdown(
            """
            ### 🚀 Getting Started

            1. **Enter a stock ticker** in the sidebar (e.g., FPT, VCB, HPG)
            2. **Select a date range** for financial data
            3. **Choose the analysis period** (yearly or quarterly)
            4. **Click "Fetch Financial Data"** to query the API

            ### 📋 Sample Tickers

            - **FPT** - FPT Corporation (Technology)
            - **VCB** - Vietcombank (Banking)
            - **HPG** - Hoa Phat Group (Steel)
            - **VNM** - Vinamilk (Consumer Goods)

            ### ℹ️ About This Demo

            This Streamlit app demonstrates the **reusability** of the RichSlow backend API.
            It queries the `/api/statements/{ticker}` endpoint and displays:

            - **Income Statements** (28 fields)
            - **Balance Sheets** (39 fields)
            - **Cash Flow Statements** (36 fields)
            - **Financial Ratios** (34+ fields)

            All data is fetched in real-time from the FastAPI backend running at
            `http://localhost:8000`.
            """
        )


if __name__ == "__main__":
    main()
