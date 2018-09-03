# Coinwatch Serverless
This is an implementation of Coinwatch using the [serverless](https://serverless.com)
framework. Serverless runs on AWS Lambda, which will cut my bill way down!

Serverless is a whole ecosystem, so many of the traditional workflows of
building a server-based web app with Express go out the window. To run the app
locally, and to deploy to AWS, is all done through serverless's CLI.

Also another good thing to note is that I'm using a number of plugins to get
this whole project to work. Notably, `serverless-offline` and `serverless-plugin-typescript`.
Yes, this is a typescript app!

One other challenge to note is that now many static resources that would normally
just be fetched from the same web server as the API now have to be hosted in S3.
I managed to get the pug files to be uploaded with the lambda functions, but
things like images and css files now have to live in S3. I have created an S3
bucket specifically for those resources. Luckily S3 is really cheap when you're
not storing lots and lots of stuff.

## Getting started
Building and running this project requires the serverless CLI.
```sh
$ npm install serverless -g
```

## How to use
To run local:
```sh
$ sls offline start
```

To deploy to aws:
```sh
$ sls deploy
```
