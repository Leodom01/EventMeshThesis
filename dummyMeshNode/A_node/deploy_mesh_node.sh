cd ../../kafka/jointProxy
sh update_image.sh &
cd ../../nodeServer/nodeService/
sh update_image.sh &
cd ../../dummyMeshNode/A_node

wait
echo "Node server and proxy images update on Docker local registry"

kubectl delete service/A-node-service
kubectl delete deployment/A-node

kubectl apply -f deployment_A_node.yaml
kubectl apply -f service_A_node.yaml
