# Image Viewer for Hoccer Wall

## Development Setup

* Install node and npm: `brew install node`
* Install gulp: `npm install -g gulp`
* Install dependencies: `npm install`
* Start watcher task: `gulp watch`

Either use public backend:

* Browse to `http://localhost:8080/?backendUrl=http://wall.talk.hoccer.de`

Or run a local instance:

* Start Hoccer [WebClientBackend](https://github.com/hoccer/hoccer-talk-spike/tree/develop/webclient-backend) (will run on localhost:5000 by default)
* Browse to `http://localhost:8080/?backendUrl=http://localhost:5000`
