with open('parsed_log.txt', 'r') as file:
    lines = file.readlines()

output_lines = []

for line in lines:
    line = line.strip()
    fields = line.split(' ')

    tempo_send = int(fields[1])
    tempo_sent = int(fields[2])
    tempo_ack = int(fields[3])
    tempo_to_kafka = int(fields[4])
    tempo_from_kafka = int(fields[5])
    tempo_got = int(fields[6])

    send_sent_diff = tempo_sent - tempo_send
    sent_ack_diff = tempo_ack - tempo_sent
    to_kafka_from_kafka_diff = tempo_from_kafka - tempo_to_kafka
    from_kafka_got_diff = tempo_got - tempo_from_kafka
    send_got_diff = tempo_got - tempo_send

    output_line = f"{line} {send_sent_diff} {sent_ack_diff} {to_kafka_from_kafka_diff} {from_kafka_got_diff} {send_got_diff}"
    output_lines.append(output_line)

with open('enriched.txt', 'w') as file:
    file.write('\n'.join(output_lines))
