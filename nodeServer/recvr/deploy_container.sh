npm install;

sudo docker build . -t cloudevents_receiver;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/cloudevents_receiver -q)

sudo docker tag cloudevents_receiver localhost:5000/cloudevents_receiver;

sudo docker push localhost:5000/cloudevents_receiver;

sudo docker image remove ${IMAGE_TO_RMV};

kubectl rollout restart deployment/cloudevents-receiver;