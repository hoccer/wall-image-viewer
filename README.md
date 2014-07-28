# Image Viewer for Hoccer Wall

## Development Setup

* Install npm: `brew install npm`
* Install gulp: `npm install -g gulp`
* Install dependencies: `npm install`
* Start watcher task: `gulp watch`

Either use public backend:

* Browse to `http://localhost:8080/?backendUrl=http://wall.talk.hoccer.de`

Or run a local instance:

* Start Hoccer [WebClientBackend](https://github.com/hoccer/talk-webclient-backend) (will run on localhost:5000 by default)
* Browse to `http://localhost:8080/?backendUrl=http://localhost:5000`
