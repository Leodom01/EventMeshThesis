package com.dominici.thesis.emesh.mavenproject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.apache.eventmesh.client.http.conf.EventMeshHttpClientConfig;
import org.apache.eventmesh.client.http.producer.EventMeshHttpProducer;
import org.apache.eventmesh.client.tcp.common.EventMeshCommon;
import org.apache.eventmesh.common.Constants;
import org.apache.eventmesh.common.utils.IPUtils;
import org.apache.eventmesh.common.utils.JsonUtils;
import org.apache.eventmesh.common.utils.ThreadUtils;

import io.cloudevents.CloudEvent;
import io.cloudevents.core.builder.CloudEventBuilder;


public class HTTPProducer {
	public static void main(String[] args) throws Exception {
		
		BufferedReader inStd = new BufferedReader(new InputStreamReader(System.in));
		
		try {
			System.out.println("HTTPProducer started...");

			EventMeshHttpClientConfig eventMeshClientConfig = EventMeshHttpClientConfig.builder()
					.liteEventMeshAddr("10.43.124.150:10105")				//Hardwired, bisogna mettere u nnome DNS al servizio emesh
					.producerGroup("TEST_PRODUCER_GROUP")
					.env("PRD")
					.idc("DEFAULT")
					.ip(IPUtils.getLocalAddress())
					.sys("0000")
					.pid(String.valueOf(ThreadUtils.getPID()))
					.userName("nacos")									//Unsure
					.password("nacos")									//Unsure
					.build();

			EventMeshHttpProducer eventMeshHttpProducer = new EventMeshHttpProducer(eventMeshClientConfig);
			Map<String, String> content = new HashMap<>();
			content.put("content", "testAsyncMessage");

			CloudEvent event = CloudEventBuilder.v1()
					.withId(UUID.randomUUID().toString())
					.withSubject("eventmesh-async-topics")
					.withSource(URI.create("/"))
					.withDataContentType("application/cloudevents+json")
					.withType(EventMeshCommon.CLOUD_EVENTS_PROTOCOL_NAME)
					.withData(JsonUtils.serialize(content).getBytes(StandardCharsets.UTF_8))
					.withExtension(Constants.EVENTMESH_MESSAGE_CONST_TTL, String.valueOf(4 * 1000))
					.build();
			
			System.out.println("HTTPProducer: Scrivi publish per pubblicare evento o altro per uscire...");
			while(inStd.readLine().equals("publish")) {
				eventMeshHttpProducer.publish(event);
				System.out.println("HTTPProducer: Evento published");
			}
			
			System.out.println("HTTPProducer: Fuori dal loop di pubblicazione, in chiusura...");
			
			eventMeshHttpProducer.close();
			
		}catch(Exception e) {
			System.out.println("HTTPProducer has encountered an exception: ");
			e.printStackTrace();
		}
	}
}
