import statistics

send_sent_diff = []
sent_ack_diff = []
to_kafka_from_kafka_diff = []
from_kafka_got_diff = []
send_got_diff = []

with open('enriched.txt', 'r') as file:
    lines = file.readlines()

for line in lines:
    fields = line.strip().split(' ')
    send_sent_diff.append(int(fields[7]))
    sent_ack_diff.append(int(fields[8]))
    to_kafka_from_kafka_diff.append(int(fields[9]))
    from_kafka_got_diff.append(int(fields[10]))
    send_got_diff.append(int(fields[11]))

# Calcolo delle medie
send_sent_mean = statistics.mean(send_sent_diff)
sent_ack_mean = statistics.mean(sent_ack_diff)
to_kafka_from_kafka_mean = statistics.mean(to_kafka_from_kafka_diff)
from_kafka_got_mean = statistics.mean(from_kafka_got_diff)
send_got_mean = statistics.mean(send_got_diff)

# Calcolo delle varianze
send_sent_variance = statistics.variance(send_sent_diff)
sent_ack_variance = statistics.variance(sent_ack_diff)
to_kafka_from_kafka_variance = statistics.variance(to_kafka_from_kafka_diff)
from_kafka_got_variance = statistics.variance(from_kafka_got_diff)
send_got_variance = statistics.variance(send_got_diff)

# Stampa delle medie
print("Media di SEND-SENT:", send_sent_mean)
print("Media di SENT-ACK:", sent_ack_mean)
print("Media di TO_KAFKA-FROM_KAFKA:", to_kafka_from_kafka_mean)
print("Media di FROM_KAFKA-GOT:", from_kafka_got_mean)
print("Media di SEND-GOT:", send_got_mean)

# Stampa delle varianze
print("Varianza di SEND-SENT:", send_sent_variance)
print("Varianza di SENT-ACK:", sent_ack_variance)
print("Varianza di TO_KAFKA-FROM_KAFKA:", to_kafka_from_kafka_variance)
print("Varianza di FROM_KAFKA-GOT:", from_kafka_got_variance)
print("Varianza di SEND-GOT:", send_got_variance)
