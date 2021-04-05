# Steam Web installation guild

### install ubuntu server 16.04

install the server

### ubuntu update

```
sudo apt-get update
```

### install curl

```
sudo apt install curl
```

### install nodejs

```
curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install nodejs
```

### check nodejs installed success or not

```
nodejs -v
npm -v
```

### install mongodb 3.6

```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
echo "deb [ arch=amd64,arm64,ppc64el,s390x ] http://repo.mongodb.com/apt/ubuntu xenial/mongodb-enterprise/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-enterprise.list
sudo apt-get update
sudo apt-get install -y mongodb-enterprise
sudo systemctl start mongod
```

### enable automatically starting MongoDB when the system starts.

```
sudo systemctl enable mongod
```

### check mongodb status

```
sudo systemctl status mongod
```

### check mongo is running

```
sudo netstat -plntu
```

### add mongo admin

```
mongo
use admin
db.createUser({user:"admin", pwd:"MONGODBPASSWORD", roles:[{role:"root", db:"admin"}]})
use seal-edutech
db.createUser({user:"seal", pwd:"MONGODBPASSWORD", roles:[{role:"readWrite", db:"seal-edutech"}]})
exit
```

### install git

```
sudo apt install git
```

### clone website to local / pull

```
sudo git clone https://github.com/sealedutech/steam
```

cd steam
sudo git pull

```

### install all package

```

cd steam
sudo npm install

```

### copy setting file

The .env_sample is a config file template, copy it to a new file.

```

cp .env_sample .env

```

### fill in config file .env

password for MONGO_URL_LIVE(MONGODBPASSWORD created above)

password for XXXXMEETING_LIVE_ADMIN_PW

localhost ip address to xxx.xxx.xxx.xxx

```

nano .env

```

### compile website

```

sudo npm run build

```

### run website

```

sudo npm run serve

```

### Nginx - install nginx, allow nginx in firewall

Nginx listen to 80 port, pass the request to localhost app port. eg. 3000;

### pm2 cluster - use all your cpu to max performance

npm install pm2 -g

Then start the server in cluster mode:
pm2 start server/server.js -i 0

if errored:
pm2 log server
pm2 report

Set pm2 to start if ubuntu reboot for some reason, follow procedure:
pm2 startup

Then save the current process on pm2 list, pm2 will auto start these process after reboot:
pm2 save

### loadtest - stress test

npm install loadtest -g

Test the server, compare before cluster and after cluster:
loadtest -n 1000 -c 100 http://localhost:3000/
```

### check stuff

netstat -plntu [check net work ports]
need nginx listen to 80 port. then pass the request to 3000

sudo systemctl enable mongod

make sure mongo is active and server is listen to 0.0.0.0:3000

df -h [check storage]
df --inodes [check inodes]

### install new ubuntu server

AWS
Let access to OpenSSH, 80, 443

sudo apt-get update
sudo apt install curl

NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh | bash
--after install, close terminal and open terminal
nvm

Node
nvm install node
node -v
npm -v

Mongo
--follow step here: https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/ (we use 4.2)
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod

Mongo Accounts
mongo
use admin
db.createUser({user:"admin", pwd:"xxxxx", roles:[{role:"root", db:"admin"}]})
use steam
db.createUser({user:"anthony", pwd:"ant@2014", roles:[{role:"readWrite", db:"steam"}]})
exit

Git
sudo apt install git

Clone the site
git clone https://github.com/sealedutech/steam
cd steam
cp .env_sample .env
--edit the .env

Nginx
sudo apt-get install nginx
sudo systemctl enable nginx

Firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw allow '27020/tcp'
sudo ufw enable

Nginx - mongodb
stream {
server {
listen 27020;
allow 61.238.131.10;
allow 210.6.192.79;
deny all;
proxy_connect_timeout 10s;
proxy_timeout 60s;
proxy_pass stream_mongo_backend;
}

        upstream stream_mongo_backend {
                server 127.0.0.1:27017;
        }

}

Nginx - SSL (certbot)
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
sudo nano /etc/nginx/sites-available/default
**Find the existing server*name line and replace the underscore, *, with your domain name:
**. . .
**server_name tinkererbox.com www.tinkererbox.com;
**. . .
sudo systemctl reload nginx
sudo certbot --nginx -d tinkererbox.com -d www.tinkererbox.com

PM2
npm install pm2 -g
pm2 startup
pm2 save
