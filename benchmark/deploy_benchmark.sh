cd ../kafka/jointProxy
sh update_image.sh &
cd ../../benchmarkEndpoints/machinegun/
sh update_image.sh &
cd ../target/
sh update_image.sh &
cd ../../benchmark

wait
echo "Machinegun, target and proxy images update on Docker local registry"

kubectl delete service/benchmark-machinegun-service
kubectl delete service/benchmark-target-service
kubectl delete deployment/benchmark-machinegun
kubectl delete deployment/benchmark-target

kubectl apply -f service_benchmark.yaml
kubectl apply -f deployment_benchmark.yaml
