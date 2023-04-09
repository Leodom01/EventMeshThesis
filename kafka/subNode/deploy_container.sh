npm install;

sudo docker build . -t kafka-sub-proxy;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/kafka-sub-proxy -q)

sudo docker tag nodejs-rmq-consumer localhost:5000/kafka-sub-proxy;

sudo docker push localhost:5000/kafka-sub-proxy;

sudo docker image remove ${IMAGE_TO_RMV};

kubectl rollout restart deployment/kafka-sub-proxy;