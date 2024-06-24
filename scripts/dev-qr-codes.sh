ip_address=$(ipconfig getifaddr en0)
echo "IP Address: $ip_address"

app_qr=http://$ip_address:3000
bio_qr=http://$ip_address:3001
cart_qr=http://$ip_address:3002
fm_qr=http://$ip_address:3003
link_qr=http://$ip_address:3004
page_qr=http://$ip_address:3005
press_qr=http://$ip_address:3006
sparrow_qr=http://$ip_address:3007
www_qr=http://$ip_address:3008

echo "app::3000"
qrencode -t ansiutf8 -o - $app_qr

echo "bio::3001"
qrencode -t ansiutf8 -o - $bio_qr

echo "cart::3002"
qrencode -t ansiutf8 -o - $cart_qr

echo "fm::3003"
qrencode -t ansiutf8 -o - $fm_qr

echo "link::3004"
qrencode -t ansiutf8 -o - $link_qr

echo "page::3005"
qrencode -t ansiutf8 -o - $page_qr

echo "press::3006"
qrencode -t ansiutf8 -o - $press_qr

echo "sparrow::3007"
qrencode -t ansiutf8 -o - $sparrow_qr

echo "www::3008"
qrencode -t ansiutf8 -o - $www_qr

echo "email::4000"
