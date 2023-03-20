npm install;

sudo docker build . -t cloudevents_sender;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/cloudevents_sender -q)

sudo docker tag cloudevents_sender localhost:5000/cloudevents_sender;

sudo docker push localhost:5000/cloudevents_sender;

sudo docker image remove ${IMAGE_TO_RMV};

kubectl rollout restart deployment/cloudevents-sender;