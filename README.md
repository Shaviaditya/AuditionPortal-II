# AuditionPortal-II
An audition portal backend to take auditions for a number of candidates such that it can take quiz rounds of multiple levels for candidates, moreover multiple roles administering can be enabled replicating the service as that of discord such that people with higher roles can review responses as well as have a greater range of control over other candidates. A custom mailer has also been implements using nodemailer package so that candidates can be served reminder mails and status mails. To enable file tranfers for questionnaires cloudinary has been applied. Moreover constant event transmissions are handled by SSE rendering.

Technologies Used: NodeJS, Postgresql, Nginx Proxy, Cloudinary, Nodemailer, Server Side Rendering.

## Requirements
Nodejs
ExpressJS
Express-handlebars

## Install
Just download the Repo,and see the steps under **First-things-to-Do**.

**Note**
Node_modules is not included, you need to get it yourself by following the steps under **First-things-to-Do**.

## Requirements
- You require a browser,and a working terminal.
- Node.js should be installed.
    -There are many resources, from which you can learn how to install Node.js

## First-things-to-Do
After downloading the Repo, and having everything of the **Requirements** follow the following steps:
- Get node_modules folder by running the following command
```sh
npm install
```
You will see that, now there is a folder called node_modules,which contains all the dependancies this project requires.
- Then run the following command to get started with project
```sh
node app.js
```
