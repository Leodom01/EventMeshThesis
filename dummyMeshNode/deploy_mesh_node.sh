cd ../kafka/jointProxy
sh update_image.sh &
cd ../../nodeServer/nodeService/
sh update_image.sh &
cd ../../dummyMeshNode

wait
echo "Node server and proxy images update on Docker local registry"

kubectl delete service/dummy-node-service
kubectl delete deployment/dummy-node-bundle

kubectl apply -f service_dummy_emesh_node.yaml
kubectl apply -f deployment_dummy_mesh_node.yaml

sleep 5

echo "Containers generated: kafka-proxy    node-service"
echo "Pod name: $(kubectl get pods -l app=dummy-node-app --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[*].metadata.name}' \| tail -n 1)"
