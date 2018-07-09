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

## Progress
Looks like I'm going to have to put the pug files into S3, as well as
other static resources that don't automatically get compiled into the lambda
build folder. This is better anyway, because lambda distributions should
be small. There's gotta be a way in the serverless framework to tell it to
upload certain files to S3 automatically.

I have the thing deployed successfully behind the domain coinwatch.fyi now. I
used the `serverless-domain-manager` plugin to handle the custom domain bullshit.
Looks like they just manually shoved an ALIAS A record into Route53 that points
at a CloudFront distribution `d34ac0zp3cnpe6.cloudfront.net`. When I was trying
to set that up manually, I was getting frustrated because Route53 wouldn't auto-
populate the ALIAS options with anything from CloudFront, but looks like
manually typing in the CloudFront distribution domain name works.

The only endpoint currently up and running is the home page. None of the
subscribe/unsubscribe features work yet. That will take some extra work because
I will need to hook up Aurora. Yes, I want to use a SQL database to manage
customer info rather than the shitty DynamoDB table I have right now. Also I
will need a place to store price data over time, so Aurora will be good for that.
Aurora is very cheap when usage is low, so I'm not worried about the cost.
I should try using TypeORM as the interface to the DB within my functions.

### 2018-07-02
This codebase will be fundamentally different than the other one because it
will be using SQL instead of DynamoDB. This will drastically change the way I
store who is subscribed to what currency, and also how I query for who to send
notifications to. So, don't worry so much about copying code over from the old
codebase. I will basically want to just rewrite the old functionality from
scratch. Email template stuff can stay the same though :).

Looks like it will be hard to use Aurora as a datastore because it's actually
fucking expensive. I totally missed the $0.04 per hour price tag. That works out
to about $29 per month-- roughly what I pay now for my beanstalk app. Sounds
like I need to get creative with how I use DynamoDB.

I had a thought, that instead of storing emails as keys and lists of coins as
values, I should store coins as keys and lists of emails as values. It makes
sense to think of each coin as its own individual mailing list. In a perfect
world, I could have a table for emails, a table for coins, and then a join table
to subscribe emails to coins, but Dynamo is not SQL and I need to mimimize the
number of queries to keep costs down.

The MVP of this product is just the daily email, and using CoinMarketCap, the
daily email doesn't even require a database. So I should migrate over the daily
email first, which then allows me to finally shut down the EC2s.
