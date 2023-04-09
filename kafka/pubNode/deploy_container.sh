npm install;

sudo docker build . -t kafka-pub-proxy;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/kafka-pub-proxy -q)

sudo docker tag kafka-pub-proxy localhost:5000/kafka-pub-proxy;

sudo docker push localhost:5000/kafka-pub-proxy;

sudo docker image remove ${IMAGE_TO_RMV};

kubectl rollout restart deployment/kafka-pub-proxy;