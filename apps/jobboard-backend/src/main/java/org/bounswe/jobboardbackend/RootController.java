package org.bounswe.jobboardbackend;

import org.bounswe.jobboardbackend.config.AppProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    private final AppProperties appProperties;

    public RootController(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @GetMapping("/")
    public MessageResponse hello() {
        return new MessageResponse("Hello from " + appProperties.getEnv() + " environment! This message will change on this PR.");
    }

    public record MessageResponse(String message) {}
}