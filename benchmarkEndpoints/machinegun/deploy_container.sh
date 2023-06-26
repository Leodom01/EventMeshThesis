npm install;

sudo docker build . -t machinegun;

IMAGE_TO_RMV=$(sudo docker images localhost:5000/machinegun -q)

sudo docker tag machinegun localhost:5000/machinegun;

sudo docker push localhost:5000/machinegun;

sudo docker image remove ${IMAGE_TO_RMV};

kubectl rollout restart deployment/machinegun;