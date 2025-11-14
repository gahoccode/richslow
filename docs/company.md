Below are the methods to retrieve company information along with data types and sample output for each method:

### 1. Overview
**Method Call**
```python
company.overview()
```

**Sample Output**
```shell
>>> company.overview()
  exchange   industry company_type  no_shareholders  foreign_percent  outstanding_share  ...  delta_in_month delta_in_year   short_name                     website  industry_id  industry_id_v2
0     HOSE  Ngân hàng           NH            25183            0.235             5589.1  ...          -0.071        -0.036  Vietcombank  https://vietcombank.com.vn          289            8355

[1 rows x 17 columns]
```

**Data Types**
```shell
Index: 1 entries, 0 to 0
Data columns (total 17 columns):
 #   Column             Non-Null Count  Dtype  
---  ------             --------------  -----  
 0   exchange           1 non-null      object 
 1   industry           1 non-null      object 
 2   company_type       1 non-null      object 
 3   no_shareholders    1 non-null      int64  
 4   foreign_percent    1 non-null      float64
 5   outstanding_share  1 non-null      float64
 6   issue_share        1 non-null      float64
 7   established_year   1 non-null      object 
 8   no_employees       1 non-null      int64  
 9   stock_rating       1 non-null      float64
 10  delta_in_week      1 non-null      float64
 11  delta_in_month     1 non-null      float64
 12  delta_in_year      1 non-null      float64
 13  short_name         1 non-null      object 
 14  website            1 non-null      object 
 15  industry_id        1 non-null      int64  
 16  industry_id_v2     1 non-null      object 
```

### 2. Company Profile
**Method Call**
```python
company.profile()
```

**Sample Output**
```shell
>>> company.profile()
                                        company_name                                    company_profile  ...                                   key_developments                                business_strategies
0  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...   Ngân hàng Thương mại Cổ phần Ngoại thương Việ...  ...    Dịch vụ tài khoản Dịch vụ huy động vốn (tiền...   Ngân hàng số 1 tại Việt Nam, một trong 100 ng...

[1 rows x 7 columns]
```

**Data Types**
```shell
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 1 entries, 0 to 0
Data columns (total 7 columns):
 #   Column               Non-Null Count  Dtype 
---  ------               --------------  ----- 
 0   company_name         1 non-null      object
 1   company_profile      1 non-null      object
 2   history_dev          1 non-null      object
 3   company_promise      0 non-null      object
 4   business_risk        1 non-null      object
 5   key_developments     1 non-null      object
 6   business_strategies  1 non-null      object
```

### 3. Shareholders
**Method Call**
```python
company.shareholders()
```

**Sample Output**
```shell
>>> company.shareholders()
                  share_holder  share_own_percent
0  Ngân Hàng Nhà Nước Việt Nam             0.7480
1          Mizuho Bank Limited             0.1500
2                         Khác             0.0295
```

**Data Types**
```shell
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 3 entries, 0 to 2
Data columns (total 2 columns):
 #   Column             Non-Null Count  Dtype  
---  ------             --------------  -----  
 0   share_holder       3 non-null      object 
 1   share_own_percent  3 non-null      float64
```

### 4. Officers
**Method Call**
```python
company.officers()
```

**Sample Output**
```shell
>>> company.officers()
            officer_name              officer_position  officer_own_percent
5      Nguyễn Thanh Tùng                 Tổng Giám đốc                  0.0
4      Nguyễn Thanh Tùng  Thành viên Hội đồng Quản trị                  0.0
7         Lê Thị Kim Nga  Thành viên Hội đồng Quản trị                  0.0
16   Nguyễn Thị Kim Oanh  Thành viên Hội đồng Quản trị                  0.0
9       Đỗ Thị Mai Hương      Thành viên Ban kiểm soát                  0.0
10         Lê Hoàng Tùng             Phó Tổng Giám đốc                  0.0
13         Đào Minh Tuấn             Phó Tổng Giám đốc                  0.0
18      La Thị Hồng Minh                Kế toán trưởng                  0.0
0          Đàm Lam Thanh                          None                  0.0
1       Đậu Thị Thúy Vân                          None                  0.0
2      Nghiêm Xuân Thành                          None                  0.0
3      Nguyễn Danh Lương                          None                  0.0
6          Nguyễn Mỹ Hào                          None                  0.0
8                Đào Hảo                          None                  0.0
11            Lê Thị Hoa                          None                  0.0
12       Nghiêm Thị Thúy                          None                  0.0
14       Nguyễn Hòa Bình                          None                  0.0
15        Trương Lệ Hiền                          None                  0.0
17  Phùng Nguyễn Hải Yến                          None                  0.0
19       PHẠM QUANG DŨNG                          None                  0.0
```

**Data Types**
```shell
<class 'pandas.core.frame.DataFrame'>
Index: 20 entries, 5 to 19
Data columns (total 3 columns):
 #   Column               Non-Null Count  Dtype  
---  ------               --------------  -----  
 0   officer_name         20 non-null     object 
 1   officer_position     8 non-null      object 
 2   officer_own_percent  20 non-null     float64
```

### 5. Subsidiaries
**Method Call**
```python
company.subsidiaries()
```

**Sample Output**
```shell
>>> company.subsidiaries()
                                     sub_company_name  sub_own_percent
0   Công ty TNHH Chứng khoán Ngân hàng Thương mại ...            1.000
1   Công Ty TNHH Một Thành Viên Kiều Hối Ngân Hàng...            1.000
2   Công ty TNHH MTV Cho Thuê Tài Chính Ngân Hàng ...            1.000
3       Công ty TNHH Tài Chính Việt Nam Tại Hồng Kông            1.000
4    Ngân Hàng TNHH MTV Ngoại Thương Việt Nam Tại Lào            1.000
5                       Công ty Chuyển Tiền Vcb Money            0.875
6                 Công ty TNHH Cao Ốc Vietcombank 198            0.700
7   Công Ty Liên Doanh Trách Nhiệm Hữu Hạn Vietcom...            0.520
8   Công ty Liên doanh Quản lý Quỹ đầu tư chứng kh...            0.510
9                  Công ty TNHH Bảo hiểm FWD Việt Nam            0.450
10      Công ty Liên Doanh Hữu Hạn Vietcombank-bonday            0.160
11           Tổng Công ty Cổ phần Bảo hiểm Petrolimex            0.080
12  Ngân hàng Thương mại Cổ phần Xuất nhập khẩu Vi...            0.045
13              Ngân hàng Thương mại Cổ phần Quân đội            0.044
14            Tổng Công ty Hàng không Việt Nam - CTCP            0.010
15  Tổng Công ty Cổ phần Khoan và Dịch vụ khoan Dầ...            0.002
16           Ngân hàng Thương mại Cổ phần Phương Đông            0.000
```

**Data Types**
```shell
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 17 entries, 0 to 16
Data columns (total 2 columns):
 #   Column            Non-Null Count  Dtype  
---  ------            --------------  -----  
 0   sub_company_name  17 non-null     object 
 1   sub_own_percent   17 non-null     float64
```

### 6. Dividends
**Method Call**
```python
company.dividends()
```

**Sample Output**
```shell
>>> company.dividends()
   exercise_date  cash_year  cash_dividend_percentage issue_method
0       25/07/23       2023                     0.181        share
1       22/12/21       2022                     0.276        share
2       22/12/21       2020                     0.120         cash
3       21/12/20       2019                     0.080         cash
4       30/12/19       2018                     0.080         cash
5       05/10/18       2017                     0.080         cash
6       28/09/17       2016                     0.080         cash
7       09/09/16       2015                     0.100         cash
8       26/06/15       2014                     0.100         cash
9       18/06/14       2013                     0.120         cash
10      26/02/13       2012                     0.120         cash
11      24/02/12       2011                     0.120         cash
12      18/07/11       2011                     0.120        share
13      10/03/10       2009                     0.120         cash
14      01/12/08       2008                     0.120         cash
```

**Data Types**
```shell
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 15 entries, 0 to 14
Data columns (total 4 columns):
 #   Column                    Non-Null Count  Dtype  
---  ------                    --------------  -----  
 0   exercise_date             15 non-null     object 
 1   cash_year                 15 non-null     int64  
 2   cash_dividend_percentage  15 non-null     float64
 3   issue_method              15 non-null     object 
```

### 7. Insider Deals
**Method Call**
```python
company.insider_deals()
```

**Sample Output**
```shell
>>> company.insider_deals()
   deal_announce_date deal_method deal_action  deal_quantity  deal_price  deal_ratio
0          2023-12-21        None         Mua         5000.0     80900.0       0.115
1          2020-12-30        None         Bán        -2523.0     64175.0       0.406
2          2020-12-23        None         Bán       -15000.0     63913.0       0.411
3          2020-04-27        None         Mua        10000.0     43434.0       1.077
4          2019-11-29        None         Bán       -10000.0     54974.0       0.641
5          2019-07-26        None         Bán       -21000.0     50592.0       0.783
6          2019-07-22        None         Bán       -37000.0     50914.0       0.772
7          2019-01-16        None         Mua        10000.0     35704.0       1.526
8          2019-01-10        None         Mua        10000.0     35447.0       1.545
9          2018-12-03        None         Mua        10000.0     37380.0       1.413
10         2018-02-08        None         Mua         8000.0     40023.0       1.254
11         2018-01-29        None         Bán        -2829.0     43268.0       1.085
12         2018-01-05        None         Mua        10000.0     34360.0       1.625
13         2018-01-03        None         Bán        -5000.0     34933.0       1.582
14         2018-01-03        None         Bán        -1700.0     34933.0       1.582
15         2017-02-07        None         Mua        10000.0     24445.0       2.690
16         2016-01-12        None         Mua        10000.0     19310.0       3.671
17         2015-03-18        None         Bán        -4000.0     15845.0       4.693
18         2015-02-12        None         Mua         1000.0     16066.0       4.614
19         2014-02-12        None         Mua        10000.0         NaN         NaN
```

**Data Types**
```shell
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 20 entries, 0 to 19
Data columns (total 6 columns):
 #   Column              Non-Null Count  Dtype         
---  ------              --------------  -----         
 0   deal_announce_date  20 non-null     datetime64[ns]
 1   deal_method         0 non-null      object        
 2   deal_action         20 non-null     object        
 3   deal_quantity       20 non-null     float64       
 4   deal_price          19 non-null     float64       
 5   deal_ratio          19 non-null     float64       
```

### 8. Events
**Method Call**
```python
company.events()
```

**Sample Output**
```shell
>>> company.events()
     rsi    rs       id  price  price_change  ...          notify_date            exer_date       reg_final_date      exer_right_date                                         event_desc
0   56.4  54.0  2566332  94400           300  ...  2024-03-12 00:00:00  2024-04-27 00:00:00  2024-03-27 00:00:00  2024-03-26 00:00:00  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...
1   52.0  61.0  2564026  89100             0  ...  2023-08-31 00:00:00  2023-08-30 00:00:00  1753-01-01 00:00:00  1753-01-01 00:00:00  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...
2   45.5  70.0  2563891  86300         -2100  ...  2023-08-23 00:00:00  2023-10-06 00:00:00  2023-09-05 00:00:00  2023-08-31 00:00:00  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...
3   61.2  56.0  2563509  88819           762  ...  2023-07-13 00:00:00  2023-07-25 00:00:00  2023-07-26 00:00:00  2023-07-25 00:00:00  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...
4   57.3  82.0  2561470  78743          -423  ...  2023-03-01 00:00:00  2023-04-21 00:00:00  2023-03-21 00:00:00  2023-03-20 00:00:00  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...
5   55.6  64.0  2560593  66889          -170  ...  2022-12-20 00:00:00  2023-01-30 00:00:00  2022-12-30 00:00:00  2022-12-29 00:00:00  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...
6   45.6  46.0  2476530  68667         -2625  ...  2022-03-15 00:00:00  2022-04-29 00:00:00  2022-03-28 00:00:00  2022-03-25 00:00:00  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...
7   65.5  56.0  2446356  75356         -1694  ...  2022-01-28 17:47:09  2022-02-14 00:00:00  1753-01-01 00:00:00  1753-01-01 00:00:00    Ngân hàng Thương mại Cổ phần Ngoại thương Vi...
8   44.5  32.0  2395944  64962          -524  ...  2021-12-16 11:58:44  2021-12-22 00:00:00  2021-12-23 00:00:00  2021-12-22 00:00:00   Ngân hàng Thương mại Cổ phần Ngoại thương Việ...
9   44.5  32.0  2395943  64962          -524  ...  2021-12-16 09:00:00  2022-01-05 00:00:00  2021-12-23 00:00:00  2021-12-22 00:00:00   Ngân hàng Thương mại Cổ phần Ngoại thương Việ...
10  51.9  30.0  1611831  64306         -1246  ...  2021-02-24 00:00:00  2021-04-23 00:00:00  2021-03-19 00:00:00  2021-03-18 00:00:00  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...
11   NaN  65.0  1481291  63590         -1366  ...  2020-12-15 09:00:00  2021-01-08 00:00:00  2020-12-22 00:00:00  2020-12-21 00:00:00   Ngân hàng Thương mại Cổ phần Ngoại thương Việ...
12   NaN  44.0  1316877  43434          -390  ...  2020-05-05 00:00:00  2020-06-26 00:00:00  2020-05-20 00:00:00  2020-05-19 00:00:00  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...
13   NaN  86.0  1306563  58004          -580  ...  2019-12-24 09:00:00  2020-01-15 00:00:00  2019-12-31 00:00:00  2019-12-30 00:00:00   Ngân hàng Thương mại Cổ phần Ngoại thương Việ...
14   NaN  58.0  1062568  38733           644  ...  2019-02-21 00:00:00  2019-04-26 00:00:00  2019-03-18 00:00:00  2019-03-15 00:00:00  Ngân hàng Thương mại Cổ phần Ngoại thương Việt...

[15 rows x 14 columns]
```

**Data Types**
```shell
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 15 entries, 0 to 14
Data columns (total 14 columns):
 #   Column                 Non-Null Count  Dtype  
---  ------                 --------------  -----  
 0   rsi                    11 non-null     float64
 1   rs                     15 non-null     float64
 2   id                     15 non-null     int64  
 3   price                  15 non-null     int64  
 4   price_change           15 non-null     int64  
 5   price_change_ratio     15 non-null     float64
 6   price_change_ratio_1m  15 non-null     float64
 7   event_name             15 non-null     object 
 8   event_code             15 non-null     object 
 9   notify_date            15 non-null     object 
 10  exer_date              15 non-null     object 
 11  reg_final_date         15 non-null     object 
 12  exer_right_date        15 non-null     object 
 13  event_desc             15 non-null     object 
```

### 9. News
**Method Call**
```python
company.news()
```

**Sample Output**
```shell
>>> company.news()
     rsi    rs    price  price_change  price_change_ratio  price_change_ratio_1m        id                                              title source         publish_date
0   41.4  50.0  91900.0         700.0               0.008                 -0.028  11170634   VCB:  Công bố đường dẫn BCTC riêng và HN Q1/2024   TCBS  2024-05-02 15:53:00
1   41.4  50.0  91900.0         700.0               0.008                 -0.028  11170648  VCB:  CBTT Biên bản họp và Nghị quyết ĐHĐCĐ th...   TCBS  2024-05-02 15:42:00
2   41.4  50.0      NaN           NaN                 NaN                    NaN  11168891  ĐHCĐ 2024 Vietcombank (VCB): Lâu dài, bán lẻ v...   TCBS  2024-04-27 13:00:00
3   40.1  49.0  91200.0         200.0               0.002                 -0.053  11168477  VCB:  Cập nhật, bổ sung tài liệu họp ĐHĐCĐ thư...   TCBS  2024-04-26 16:56:00
4   35.4  57.0  90600.0         100.0               0.001                 -0.060  11160361  Vốn chủ sở hữu của 'anh cả' ngành ngân hàng tă...   TCBS  2024-04-22 08:59:00
5   35.4  51.0  90500.0           0.0               0.000                 -0.022  11158655  VCB: Báo cáo tài chính Năm (Kỳ báo cáo từ 01/0...   TCBS  2024-04-19 09:58:00
6   36.9  50.0  90500.0        -500.0              -0.005                 -0.027  11157646                 VCB:  Báo cáo thường niên năm 2023   TCBS  2024-04-17 15:44:00
7   47.9  40.0  96000.0        2200.0               0.023                  0.000  11142101  VCB:  CBTT Tài liệu họp ĐHĐCĐ thường niên năm ...   TCBS  2024-04-04 16:23:00
8   54.6  46.0  94500.0        -700.0              -0.007                 -0.016  11138523           VCB:  Thông báo thay đổi nhân sự công ty   TCBS  2024-04-02 18:14:00
9   53.4  36.0  95200.0         300.0               0.003                 -0.022  11135850  VCB:  Giải trình chênh lệch LNST năm 2023 so v...   TCBS  2024-04-01 14:05:00
10  58.2  70.0  96300.0         600.0               0.006                  0.076  11129685  VCB:  HĐQT phê duyệt chủ trương giao dịch mua ...   TCBS  2024-03-26 17:28:00
11  62.9  62.0  95000.0       -1000.0              -0.010                  0.057  11117298  VCB:  HĐQT phê duyệt giới hạn tiền gửi đối với...   TCBS  2024-03-14 16:51:00
12  62.9  62.0  95000.0       -1000.0              -0.010                  0.057  11116499  Bloomberg: Ngân hàng Vietcombank (VCB) có thể ...   TCBS  2024-03-14 09:41:00
13  56.4  54.0  94400.0         300.0               0.003                  0.050  11113325  VCB:  Thông báo ngày ĐKCC để thực hiện quyền t...   TCBS  2024-03-12 09:20:00
14  73.1  70.0  97300.0           0.0               0.000                  0.084  11103770  VCB:  Nghị quyết HĐQT về việc điều chỉnh thời ...   TCBS  2024-03-01 15:58:00
```

**Data Types**
```shell
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 15 entries, 0 to 14
Data columns (total 10 columns):
 #   Column                 Non-Null Count  Dtype  
---  ------                 --------------  -----  
 0   rsi                    15 non-null     float64
 1   rs                     15 non-null     float64
 2   price                  14 non-null     float64
 3   price_change           14 non-null     float64
 4   price_change_ratio     14 non-null     float64
 5   price_change_ratio_1m  14 non-null     float64
 6   id                     15 non-null     int64  
 7   title                  15 non-null     object 
 8   source                 15 non-null     object 
 9   publish_date           15 non-null     object 
```
