ip_address=$(ipconfig getifaddr en0)
echo "IP Address: $ip_address"

app_qr=http://$ip_address:3000
link_qr=http://$ip_address:3001
www_qr=http://$ip_address:3002
press_qr=http://$ip_address:3005

echo "app:"
qrencode -t ansiutf8 -o - $app_qr

echo "link:"
qrencode -t ansiutf8 -o - $link_qr

echo "www:"
qrencode -t ansiutf8 -o - $www_qr

echo "press:"
qrencode -t ansiutf8 -o - $press_qr


