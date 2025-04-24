package org.bounswe.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    // This is the parent application
    // Each microservice has its own main application class
    // This class can be used to define common configurations
    // See the discovery-service, api-gateway, config-service, user-service, and product-service modules

}
