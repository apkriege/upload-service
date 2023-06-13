
TAG ?= latest

all: clean install build test

install:
	npm install

run:
	npm start

build:
	npm run build

test:
	npm run test

image:
	docker build . -t uploader

container: image
	docker run --rm -it uploader -p 3002

clean:
	rm -rf node_modules
	docker image rm uploader
