ip_address=$(ipconfig getifaddr en0)
echo "IP Address: $ip_address"

app_qr=http://$ip_address:3000
link_qr=http://$ip_address:3001
www_qr=http://$ip_address:3002
press_qr=http://$ip_address:3005
cart_qr=http://$ip_address:3007

echo "app::3000"
qrencode -t ansiutf8 -o - $app_qr

echo "www::3001"
qrencode -t ansiutf8 -o - $www_qr

echo "link::3002"
qrencode -t ansiutf8 -o - $link_qr

echo "press::3005"
qrencode -t ansiutf8 -o - $press_qr

echo "cart::3007"
qrencode -t ansiutf8 -o - $cart_qr

