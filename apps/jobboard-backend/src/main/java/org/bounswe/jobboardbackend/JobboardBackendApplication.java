package org.bounswe.jobboardbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class JobboardBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobboardBackendApplication.class, args);
    }

}
