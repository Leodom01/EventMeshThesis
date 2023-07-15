import matplotlib.pyplot as plt

data = []
send_sent_diff = []
to_kafka_from_kafka_diff = []
send_got_diff = []

with open('enriched.txt', 'r') as file:
    lines = file.readlines()

for line in lines:
    fields = line.strip().split(' ')
    send_time = int(fields[1])
    sent_ack = int(fields[8])
    to_kafka_from_kafka = int(fields[9])
    send_got = int(fields[11])

    data.append(send_time)
    send_sent_diff.append(sent_ack)
    to_kafka_from_kafka_diff.append(to_kafka_from_kafka)
    send_got_diff.append(send_got)

# Plot 1: SENT-ACK
plt.figure(figsize=(10, 6))
plt.plot(data, send_sent_diff)
plt.xlabel('Tempo SEND')
plt.ylabel('SENT-ACK')
plt.title('Grafico SENT-ACK')
plt.grid(True)

# Plot 2: TO_KAFKA-FROM_KAFKA
plt.figure(figsize=(10, 6))
plt.plot(data, to_kafka_from_kafka_diff)
plt.xlabel('Tempo SEND')
plt.ylabel('TO_KAFKA-FROM_KAFKA')
plt.title('Grafico TO_KAFKA-FROM_KAFKA')
plt.grid(True)

# Plot 3: SEND-GOT
plt.figure(figsize=(10, 6))
plt.plot(data, send_got_diff)
plt.xlabel('Tempo SEND')
plt.ylabel('SEND-GOT')
plt.title('Grafico SEND-GOT')
plt.grid(True)

# Per esportare i grafici come immagini
# Grafico 1: SENT-ACK
plt.figure(figsize=(10, 6))
plt.plot(data, send_sent_diff)
plt.xlabel('Tempo SEND')
plt.ylabel('SENT-ACK')
plt.title('Grafico SENT-ACK')
plt.grid(True)
plt.savefig('grafico_sent_ack.png')

# Grafico 2: TO_KAFKA-FROM_KAFKA
plt.figure(figsize=(10, 6))
plt.plot(data, to_kafka_from_kafka_diff)
plt.xlabel('Tempo SEND')
plt.ylabel('TO_KAFKA-FROM_KAFKA')
plt.title('Grafico TO_KAFKA-FROM_KAFKA')
plt.grid(True)
plt.savefig('grafico_to_kafka_from_kafka.png')

# Grafico 3: SEND-GOT
plt.figure(figsize=(10, 6))
plt.plot(data, send_got_diff)
plt.xlabel('Tempo SEND')
plt.ylabel('SEND-GOT')
plt.title('Grafico SEND-GOT')
plt.grid(True)
plt.savefig('grafico_send_got.png')
