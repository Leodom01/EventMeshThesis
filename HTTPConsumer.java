package com.dominici.thesis.emesh.mavenproject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.eventmesh.client.http.conf.EventMeshHttpClientConfig;
import org.apache.eventmesh.client.http.consumer.EventMeshHttpConsumer;
import org.apache.eventmesh.common.protocol.SubscriptionItem;
import org.apache.eventmesh.common.protocol.SubscriptionMode;
import org.apache.eventmesh.common.protocol.SubscriptionType;
import org.apache.eventmesh.common.utils.IPUtils;
import org.apache.eventmesh.common.utils.ThreadUtils;

/**
 * 
 * The class sub to topic eventmesh-async-topics and POST the cloudmessage to localhost:8080/callback (there should be a spring parser there
 * 
 * @author leodom01
 *
 */

public class HTTPConsumer {
	
	//Loopback url to the SubController.java file that implements a Spring Boot controller, which receive and perses the message
	final static String url = "http://localhost:8080/callback";	//vuole questi due valori static (COME MAI?)
	final static List<SubscriptionItem> topicList = new ArrayList<>(Arrays.asList(
			new SubscriptionItem("eventmesh-async-topics", SubscriptionMode.CLUSTERING, SubscriptionType.ASYNC)
			));
	final static List<String> topicNames = new ArrayList<>(topicList.size());
	
	public static void main(String[] args) {
		
		try {
			System.out.println("HTTPConsumer started...");
			
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
			//Devo mettere il path altrimenti se importo import org.apache.eventmesh.client.http.consumer.EventMeshHttpConsumer; dice che EventMeshHttpConsumer è definito da due parti...
			EventMeshHttpConsumer eventMeshHttpConsumer = new EventMeshHttpConsumer(eventMeshClientConfig);
		    eventMeshHttpConsumer.heartBeat(topicList, url);
		    eventMeshHttpConsumer.subscribe(topicList, url);
		    
		    System.out.println("HTTPConsumer: tutti i messaggi dovrebbero ora andare a "+url);
		    //Ottengo lista di stringhe con i nomi degli item da cui unsubscribe
		    for(SubscriptionItem temp : topicList) {
		    	topicNames.add(temp.getTopic());
		    }
		    
		    System.out.println("HTTPConsumer: Mi appresto ad unsubcribe...");
		    eventMeshHttpConsumer.unsubscribe(topicNames, url);		//Per quale cavolo di motivo non accetta la lista di SubscriptionItem come subscribe
		    
		    eventMeshHttpConsumer.close();
		}catch(Exception e) {
			System.out.println("HTTPConsumer has encountered an exception: ");
			e.printStackTrace();
		}
		
		
		
	}
	
	
}