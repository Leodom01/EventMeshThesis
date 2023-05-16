npm install;

sudo docker build . -t kafka-test-consumer;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/kafka-test-consumer -q)

sudo docker tag kafka-test-consumer localhost:5000/kafka-test-consumer;

sudo docker push localhost:5000/kafka-test-consumer;

sudo docker image remove ${IMAGE_TO_RMV};

kubectl rollout restart deployment/kafka-test-consumer;