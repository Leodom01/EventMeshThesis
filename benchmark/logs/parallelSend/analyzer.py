class LogEntry:
    def __init__(self, uuid):
        self.uuid = uuid
        self.timestamps = {}

def parse_log(file_path):
    log_entries = {}
    
    with open(file_path, 'r') as file:
        for line in file:
            parts = line.strip().split()
            
            action_name = parts[0]
            source_name = parts[1]
            uuid = parts[2]
            timestamp = parts[3]
            
            if uuid.startswith('R'):
                continue
            
            key = f"{source_name}_{action_name}"
            
            if uuid not in log_entries:
                log_entries[uuid] = LogEntry(uuid)
            
            log_entries[uuid].timestamps[key] = timestamp
    
    return log_entries

def save_entries_to_file(log_entries, output_file):
    with open(output_file, 'w') as file:
        file.write("UUID machinegun_SEND machinegun_SENT machinegun_ACK machinegun-proxy_TO_KAFKA target-proxy_FROM_KAFKA target_GOT")
        for uuid, entry in log_entries.items():
            if not uuid.startswith('R'):
                file.write(f"{uuid}")
                
                for key, timestamp in entry.timestamps.items():
                    file.write(f" {timestamp}")
                
                file.write("\n")

# Example usage
input_file = 'log.txt'
output_file = 'parsed_log.txt'

log_entries = parse_log(input_file)
save_entries_to_file(log_entries, output_file)
