# Exchange Rate
## Sample Output
```python
>>> from vnstock.explorer.misc.exchange_rate import *
>>> vcb_exchange_rate(date='2024-05-10')

   currency_code        currency_name  buy _cash buy _transfer       sell        date
2            AUD    AUSTRALIAN DOLLAR  16,391.52     16,557.09  17,088.21  2024-05-10
3            CAD      CANADIAN DOLLAR  18,129.99     18,313.13  18,900.57  2024-05-10
4            CHF          SWISS FRANC  27,377.09     27,653.63  28,540.69  2024-05-10
5            CNY         CHINESE YUAN   3,450.26      3,485.12   3,597.45  2024-05-10
6            DKK         DANISH KRONE          -      3,611.55   3,749.84  2024-05-10
7            EUR                 EURO  26,739.75     27,009.85  28,205.84  2024-05-10
8            GBP    UK POUND STERLING  31,079.41     31,393.35  32,400.37  2024-05-10
9            HKD     HONG KONG DOLLAR   3,173.85      3,205.91   3,308.75  2024-05-10
10           INR         INDIAN RUPEE          -        303.97     316.13  2024-05-10
11           JPY         JAPANESE YEN     158.55        160.16     167.81  2024-05-10
12           KRW           KOREAN WON      16.12         17.91      19.53  2024-05-10
13           KWD        KUWAITI DINAR          -     82,587.83  85,889.30  2024-05-10
14           MYR    MALAYSIAN RINGGIT          -      5,315.22   5,431.13  2024-05-10
15           NOK      NORWEGIAN KRONE          -      2,304.92   2,402.77  2024-05-10
16           RUB        RUSSIAN RUBLE          -        262.29     290.35  2024-05-10
17           SAR  SAUDI ARABIAN RIYAL          -      6,767.44   7,037.97  2024-05-10
18           SEK        SWEDISH KRONA          -      2,301.30   2,399.00  2024-05-10
19           SGD     SINGAPORE DOLLAR  18,339.11     18,524.35  19,118.57  2024-05-10
20           THB            THAI BAHT     612.76        680.85     706.92  2024-05-10
21           USD            US DOLLAR  25,154.00     25,184.00  25,484.00  2024-05-10
```

## Data type
```python
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 20 entries, 2 to 21
Data columns (total 6 columns):
 #   Column         Non-Null Count  Dtype 
---  ------         --------------  ----- 
 0   currency_code  20 non-null     object
 1   currency_name  20 non-null     object
 2   buy _cash      20 non-null     object
 3   buy _transfer  20 non-null     object
 4   sell           20 non-null     object
 5   date           20 non-null     object
dtypes: object(6)
memory usage: 1.1+ KB
```

# Gold Price
## SJC
### Sample Output

```python
>>> from vnstock.explorer.misc.gold_price import * 
>>> sjc_gold_price()

Cập nhật lúc: 10:21:24 AM 28/05/2024
Đơn vị tính: Đơn vị tính: VNĐ/lượng
                                                name   buy_price  sell_price
0                                   SJC 1L, 10L, 1KG  88,500,000  90,500,000
1                                             SJC 5c  88,500,000  90,520,000
2                                 SJC 2c, 1C, 5 phân  88,500,000  90,530,000
3          Vàng nhẫn SJC 99,99 | 1 chỉ, 2 chỉ, 5 chỉ  74,950,000  76,550,000
4  Vàng nhẫn SJC 99,99 | 0.3 chỉ,  0.5 chỉ74,950,...  74,950,000  76,650,000
5                                    Nữ Trang 99.99%  74,750,000  75,750,000
6                                       Nữ Trang 99%  73,000,000  75,000,000
7                                       Nữ Trang 68%  49,165,000  51,665,000
8                                     Nữ Trang 41.7%  29,241,000  31,741,000
```

### Data type

```python
<class 'pandas.core.frame.DataFrame'>
Index: 9 entries, 0 to 8
Data columns (total 3 columns):
 #   Column      Non-Null Count  Dtype 
---  ------      --------------  ----- 
 0   name        9 non-null      object
 1   buy_price   9 non-null      object
 2   sell_price  9 non-null      object
dtypes: object(3)
memory usage: 288.0+ bytes
```

## BTMC
### Sample Output

```python
>>> btmc_goldprice()
                                                 name karat gold_content buy_price sell_price world_price              time
47                          VÀNG MIẾNG SJC (Vàng SJC)   24k        999.9   8845000    9000000     7338000  28/05/2024 08:52
1         QUÀ MỪNG BẢN VỊ VÀNG (Quà Mừng Bản Vị Vàng)   24k        999.9   7542000    7682000     7319000  28/05/2024 13:50
0              VÀNG MIẾNG VRTL (Vàng Rồng Thăng Long)   24k        999.9   7542000    7682000     7319000  28/05/2024 13:50
2               NHẪN TRÒN TRƠN (Vàng Rồng Thăng Long)   24k        999.9   7542000    7682000     7319000  28/05/2024 13:50
35        QUÀ MỪNG BẢN VỊ VÀNG (Quà Mừng Bản Vị Vàng)   24k        999.9   7528000    7673000     7338000  28/05/2024 08:54
46              NHẪN TRÒN TRƠN (Vàng Rồng Thăng Long)   24k        999.9   7528000    7673000     7338000  28/05/2024 08:52
4   TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 999.9 (Vàn...   24k        999.9   7465000    7655000     7319000  28/05/2024 13:50
5   TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 99.9 (Vàng...   24k         99.9   7455000    7645000     7319000  28/05/2024 13:50
3                  VÀNG NGUYÊN LIỆU (Vàng thị trường)   24k        999.9   7405000          0     7319000  28/05/2024 13:50

```
### Data type

```python
<class 'pandas.core.frame.DataFrame'>
Index: 49 entries, 47 to 36
Data columns (total 7 columns):
 #   Column        Non-Null Count  Dtype 
---  ------        --------------  ----- 
 0   name          49 non-null     object
 1   karat         49 non-null     object
 2   gold_content  49 non-null     object
 3   buy_price     49 non-null     object
 4   sell_price    49 non-null     object
 5   world_price   49 non-null     object
 6   time          49 non-null     object
dtypes: object(7)
memory usage: 3.1+ KB
```