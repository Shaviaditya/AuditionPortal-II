#!/bin/bash
USER="rudraditya"
PASS="Postgresql311"
HOST="127.0.0.1"
DATABASE="audition_db"
echo "Hi, user enter your username, email, and password to signup as superuser"
echo
read -p 'Username: ' uservar
read -p 'Email : ' emailvar
read -sp 'Password: ' passvar
sudo apt-get install postgresql-contrib libpq-dev
psql postgresql://$USER:$PASS@$HOST/$DATABASE << EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION pgcrypto;
INSERT INTO users(uuid,username,email,password,role,"createdAt","updatedAt") 
VALUES (uuid_generate_v4(),'$uservar','$emailvar',crypt('$passvar', gen_salt('bf', 10)),'su',now(),now());
EOF