cd ../../kafka/jointProxy
sh update_image.sh &
cd ../../nodeServer/nodeService/
sh update_image.sh &
cd ../../dummyMeshNode/B_node

wait
echo "Node server and proxy images update on Docker local registry"

kubectl delete service/B-node-service
kubectl delete deployment/B-node

kubectl apply -f deployment_B_node.yaml
kubectl apply -f service_B_node.yaml
