npm install;

sudo docker build . -t nodejs-rmq-producer;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/nodejs-rmq-producer -q)

sudo docker tag nodejs-rmq-producer localhost:5000/nodejs-rmq-producer;

sudo docker push localhost:5000/nodejs-rmq-producer;

sudo docker image remove ${IMAGE_TO_RMV};

kubectl rollout restart deployment/nodejs-rmq-producer;