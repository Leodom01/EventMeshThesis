cd ../../kafka/jointProxy
sh update_image.sh &
cd ../../benchmarkEndpoints/target
sh update_image.sh &
cd ../../benchmark/target

wait
echo "target node and proxy images update on Docker local registry"

kubectl delete service/target-service
kubectl delete deployment/target

kubectl apply -f deployment_target.yaml
kubectl apply -f service_target.yaml
