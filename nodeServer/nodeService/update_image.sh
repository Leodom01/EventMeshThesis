npm install;

sudo docker build . -t node-service;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/node-service -q)

sudo docker tag node-service localhost:5000/node-service;

sudo docker push localhost:5000/node-service;

sudo docker image remove ${IMAGE_TO_RMV};