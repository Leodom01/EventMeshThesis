npm install;

sudo docker build . -t nodejs-rmq-consumer;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/nodejs-rmq-consumer -q)

sudo docker tag nodejs-rmq-consumer localhost:5000/nodejs-rmq-consumer;

sudo docker push localhost:5000/nodejs-rmq-consumer;

sudo docker image remove ${IMAGE_TO_RMV};

kubectl rollout restart deployment/nodejs-rmq-consumer;