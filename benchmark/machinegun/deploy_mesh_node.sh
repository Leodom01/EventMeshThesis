cd ../../kafka/jointProxy
sh update_image.sh &
cd ../../benchmarkEndpoints/machinegun
sh update_image.sh &
cd ../../benchmark/machinegun

wait
echo "Machinegun node and proxy images updated on Docker local registry"

kubectl delete service/machinegun-service
kubectl delete deployment/machinegun

kubectl apply -f deployment_machinegun.yaml
kubectl apply -f service_machinegun.yaml
