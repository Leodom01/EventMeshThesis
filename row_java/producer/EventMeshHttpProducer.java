package com.dominici.thesis.emesh.mavenproject;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.Random;

//PORCHETTATA MASSIMA: Non riusciamo a risolvere la dipendenza per HTTPClientConfig e quindi ho 
//ricreato a mano quella classe dentro il mio workspace per vedere se effettivamente funziona aggiungendola
import org.apache.eventmesh.client.http.conf.EventMeshHttpClientConfig;
import org.apache.eventmesh.client.tcp.common.EventMeshCommon;
import org.apache.eventmesh.common.Constants;
import org.apache.eventmesh.common.utils.IPUtils;
import org.apache.eventmesh.common.utils.JsonUtils;
import org.apache.eventmesh.common.utils.ThreadUtils;

import io.cloudevents.CloudEvent;
import io.cloudevents.core.builder.CloudEventBuilder;
import io.cloudevents.core.data.PojoCloudEventData;
import io.cloudevents.core.provider.EventFormatProvider;
import io.cloudevents.jackson.JsonFormat;

public class EventMeshHttpProducer {

	public static void main(String args[]) {
		
		System.out.println("HTTProducer started...");
		
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
		
		//Devo mettere il path altrimenti se importo import org.apache.eventmesh.client.http.producer.EventMeshHttpProducer; dice che EventMeshHttpProducer è definito da due parti...
		org.apache.eventmesh.client.http.producer.EventMeshHttpProducer eventMeshHttpProducer = new org.apache.eventmesh.client.http.producer.EventMeshHttpProducer(eventMeshClientConfig);

	    
		CloudEvent ce = CloudEventBuilder.v1()
                .withId("TEST-#" + new Random().nextInt(10000))
                .withSubject("eventmesh-async-topics")
                .withDataContentType("application/cloudevents+json")
                //.withType("com.demo.weather-report")
                .withType(EventMeshCommon.CLOUD_EVENTS_PROTOCOL_NAME)
                .withSource(URI.create("https://cloudevents-sender.default.svc.cluster.local/send"))
                .withData(JsonUtils.serialize("{test: \'Here we come!\'}").getBytes(StandardCharsets.UTF_8))
                .withExtension(Constants.EVENTMESH_MESSAGE_CONST_TTL, String.valueOf(4 * 1000))
                 //.withData()		Qui andrebbero i dati con JsonFormat.binaryEncode(new String("TEST msg").getBytes()) ma non trovo binaryEncode
                .build();
		
		eventMeshHttpProducer.publish(ce);
		System.out.println("Event produced!");
		
	    
	}
	
}