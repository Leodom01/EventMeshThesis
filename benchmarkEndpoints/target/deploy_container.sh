npm install;

sudo docker build . -t target;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/target -q)

sudo docker tag target localhost:5000/target;

sudo docker push localhost:5000/target;

sudo docker image remove ${IMAGE_TO_RMV};

kubectl rollout restart deployment/target;