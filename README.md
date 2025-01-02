[![Docker Automated build](https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg)](https://hub.docker.com/r/paschmann/changd/)

<img src="./frontend/src/assets/screenshot-1.png" width="100%">

###

Changd is a open source web monitoring application and a self hosted free alternative to SaaS-based solutions. Changd can currently be used for automated monitoring visual site changes (using differential screenshots), XPath's or data returned from API endpoints. It is currently developed using Typescript, React and AntD for the Frontend UI, and the Backend/API is written in JS and running on Node.js. Changd has multiple configuration options and screenshots can be stored on Amazon S3 or locally. Notifications can be sent using your own SMTP service or Amazon SES.

I developed Changd because I wanted a free website monitoring solution that I could host locally and have full control over.

#### Monitoring Use Cases

- Content is changed on a website
- Online shopping price changes
- Get notified when a news article is changed
- Detect changes in API responses
- Monitor specific text (via XPath) changes
- If a website gets defaced, hacked, or changed without your knowledge
- Monitor your site availability (online or offline)
- Monitor competitor websites for changes
- Be sure content is displayed correctly

#### Features

- Monitors Visual changes, APIs or HTML XPaths
- Run using docker, locally or in a scaled node environment
- Quickly and easily setup new jobs
- Notifcations (or any [Reach SDK](https://www.github.com/paschmann/reach-sdk) supported notification type) when a condition is met
- Visual screenshot included in email notifications
- Supports email via SMTP or Amazon SES Notifications
- Store screenshots in Locally or in AWS S3
- Data is persisted in a Postgres DB
- Includes a history of changes
- Usage and change related charts
- Supports multiple users
- Open Source

Changd is an open source alternative to apps like Stillio, ChangeTower, Hexowatch, VisualPing or Wachete.

## Getting Started

### Prerequisites

Running Locally:
[Node.js/npm](https://nodejs.org/en/)

Or using Docker:
[Docker](https://docs.docker.com/get-docker/)

## Running from Docker

NB: If using Docker on a Apple Silicon Mac, you need to enable the setting: 'Use Rosetta for x86/amd64 emulation on Apple Silicon' see [here](https://github.com/puppeteer/puppeteer/issues/7746#issuecomment-1382021497)

Running from docker is the quickest and easiet method for testing the application. Clone the repo and run:

```
git clone https://github.com/paschmann/changd
docker-compose up
```
Open your browser to http://localhost:80

Create a new account using the "Register" button on the login screen.

## Running Locally
#### Installing

1. Clone/download the Changd repository or a [release](https://www.github.com/paschmann/changd)
2. Install npm packages in the frontend and server folders
3. Set variables in the server/.env (Copy from .env_template)

```
git clone https://github.com/paschmann/changd
cd changd
cd server
cp .env_template .env
npm install
cd ..
cd frontend
npm install
```

#### Running

I suggest opening two terminal windows to run the frontend and the backend, if you want the Cron service to run in the background periodically, you will need a third terminal as well.

```
cd server
npm run dev
cd ..
cd frontend
npm start
```

Optional (Cron Service):
```
cd server
npm run devcron
```

Once running, your web application frontend should be available on http://localhost:3000, the API/backend should be available on http://localhost:8000. The frontend API calls will be proxied to port 8000 using the proxy referenced in the frontend/package.json file.

#### AWS S3 Storage

If you would like to reduce your local file system storage and use AWS S3, be sure to specify a S3_BUCKET filename in your .env file along with your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY. This should be a IAM User with S3 Access (suggested).

## License

This project is licensed under the MIT License - see the [license](license) file for details
