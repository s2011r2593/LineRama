import urllib.request
from datetime import datetime
import json

y = datetime.today().strftime('%Y')
m = datetime.today().strftime('%m')
d = datetime.today().strftime('%d')

year_range = 1

contents = urllib.request.urlopen('https://api.exchangeratesapi.io/history?start_at=' + str((int(y)-year_range)) + '-' + m +'-' + d +'&end_at=' + y +'-' + m +'-' + d + '&symbols=EUR,JPY,GBP,CAD,SEK,CHF&base=USD')
parsed = json.load(contents)
rates = parsed['rates']

dates = sorted(parsed['rates'], key=lambda x: datetime.strptime(x, '%Y-%m-%d'))

points = []
eur = []
jpy = []
gbp = []
cad = []
sek = []
chf = []

j = 0

for i in dates:
    points.append(i)
    eur.append(rates[i]['EUR'])
    jpy.append(rates[i]['JPY'])
    gbp.append(rates[i]['GBP'])
    cad.append(rates[i]['CAD'])
    sek.append(rates[i]['SEK'])
    chf.append(rates[i]['CHF'])
    j += 1

e_dat = []
j_dat = []
g_dat = []
c_dat = []
s_dat = []
f_dat = []

for i in range(len(points)):
    e_dat.append({'x': points[i], 'y': eur[i]})
    j_dat.append({'x': points[i], 'y': jpy[i]})
    g_dat.append({'x': points[i], 'y': gbp[i]})
    c_dat.append({'x': points[i], 'y': cad[i]})
    s_dat.append({'x': points[i], 'y': sek[i]})
    f_dat.append({'x': points[i], 'y': chf[i]})

with open('./assets/json/eur.json', 'w') as e_f:
    json.dump(e_dat, e_f, ensure_ascii=False, indent=4)

with open('./assets/json/jpy.json', 'w') as j_f:
    json.dump(j_dat, j_f, ensure_ascii=False, indent=4)

with open('./assets/json/gbp.json', 'w') as g_f:
    json.dump(g_dat, g_f, ensure_ascii=False, indent=4)

with open('./assets/json/cad.json', 'w') as c_f:
    json.dump(c_dat, c_f, ensure_ascii=False, indent=4)

with open('./assets/json/sek.json', 'w') as s_f:
    json.dump(s_dat, s_f, ensure_ascii=False, indent=4)

with open('./assets/json/chf.json', 'w') as f_f:
    json.dump(f_dat, f_f, ensure_ascii=False, indent=4)

print(len(e_dat))
