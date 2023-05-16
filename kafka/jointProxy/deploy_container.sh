npm install;

sudo docker build . -t kafka-proxy;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/kafka-proxy -q)

sudo docker tag kafka-proxy localhost:5000/kafka-proxy;

sudo docker push localhost:5000/kafka-proxy;

sudo docker image remove ${IMAGE_TO_RMV};

kubectl rollout restart deployment/kafka-proxy;